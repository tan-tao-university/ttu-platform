import { Injectable } from '@nestjs/common';
import {
  ComponentNotRegisteredError,
  SectionValidationError,
  validateSection,
} from '@ttu/cms-registry';
import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '../../db';
import {
  type PageRevision,
  type PageTranslation,
  auditLogs,
  pageRevisions,
  pages,
  pageSectionTranslations,
  pageSections,
  pageTranslations,
  publicRoutes,
  redirects,
} from '../../db/schema';
import { ApiError } from '../../common/http/api-error';
import { isUniqueViolation } from '../../common/db/postgres-error.util';
import type { PublishPageDto } from '../dto/publish-page.dto';
import type { PageSectionSnapshot, PageSnapshot } from '../page.types';

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * The publish/restore transaction logic design doc 06 §10-11 / doc 02 §9-10 describe, adapted from
 * the pattern `ContentPublishingService` already ships for Content — validate → snapshot →
 * immutable revision → move the published pointer → keep the public route registry in sync, all in
 * one transaction, audited, never partially applied.
 */
@Injectable()
export class PagePublishingService {
  async publish(
    pageId: string,
    locale: string,
    actorUserId: string,
    dto: PublishPageDto,
  ): Promise<{ translation: PageTranslation; revision: PageRevision }> {
    return db.transaction(async (tx) => {
      const [page] = await tx
        .select()
        .from(pages)
        .where(and(eq(pages.id, pageId), sql`${pages.deletedAt} IS NULL`));
      if (!page) throw pageNotFound(pageId);

      const [translation] = await tx
        .select()
        .from(pageTranslations)
        .where(and(eq(pageTranslations.pageId, pageId), eq(pageTranslations.locale, locale)));
      if (!translation) throw translationNotFound(pageId, locale);

      const sectionRows = await tx
        .select()
        .from(pageSections)
        .where(eq(pageSections.pageId, pageId))
        .orderBy(pageSections.sortOrder);

      const sections: PageSectionSnapshot[] = [];
      for (const section of sectionRows) {
        const [sectionTranslation] = await tx
          .select()
          .from(pageSectionTranslations)
          .where(
            and(
              eq(pageSectionTranslations.sectionId, section.id),
              eq(pageSectionTranslations.locale, locale),
            ),
          );
        if (!sectionTranslation) {
          throw new ApiError(
            422,
            'validation_error',
            'Dữ liệu không hợp lệ',
            `Section "${section.id}" has no "${locale}" translation`,
            [
              {
                field: 'sections',
                code: 'incomplete_translation',
                message: `Every section must have a "${locale}" translation before publishing`,
              },
            ],
          );
        }

        const validated = validateComponentContract({
          componentKey: section.componentKey,
          componentVersion: section.componentVersion,
          content: sectionTranslation.content,
          config: section.config,
          style: section.style,
        });

        sections.push({
          id: section.id,
          componentKey: section.componentKey,
          componentVersion: section.componentVersion,
          sortOrder: section.sortOrder,
          isVisible: section.isVisible,
          config: validated.config,
          style: validated.style,
          content: validated.content,
        });
      }

      const [{ maxVersion }] = await tx
        .select({ maxVersion: sql<number>`coalesce(max(${pageRevisions.versionNumber}), 0)` })
        .from(pageRevisions)
        .where(and(eq(pageRevisions.pageId, pageId), eq(pageRevisions.locale, locale)));
      const versionNumber = maxVersion + 1;

      const snapshot: PageSnapshot = {
        page: { pageType: page.pageType },
        translation: {
          slug: translation.slug,
          path: translation.path,
          title: translation.title,
          seoTitle: translation.seoTitle,
          seoDescription: translation.seoDescription,
          ogTitle: translation.ogTitle,
          ogDescription: translation.ogDescription,
          ogImageId: translation.ogImageId,
          canonicalUrl: translation.canonicalUrl,
          robotsIndex: translation.robotsIndex,
          robotsFollow: translation.robotsFollow,
        },
        sections,
      };

      const [revision] = await tx
        .insert(pageRevisions)
        .values({
          pageId,
          locale,
          versionNumber,
          snapshot,
          createdBy: actorUserId,
          publishNote: dto.publishNote,
        })
        .returning();

      const [publishedTranslation] = await tx
        .update(pageTranslations)
        .set({
          publishedRevisionId: revision.id,
          status: 'PUBLISHED',
          publishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(eq(pageTranslations.pageId, pageId), eq(pageTranslations.locale, locale)))
        .returning();

      await syncPublicRoute(tx, { locale, path: translation.path, pageId, actorUserId });

      await tx.insert(auditLogs).values({
        actorUserId,
        action: 'page.publish',
        entityType: 'page',
        entityId: pageId,
        metadata: { locale, versionNumber, revisionId: revision.id },
      });

      return { translation: publishedTranslation, revision };
    });
  }

  /**
   * Rollback never mutates the historical revision (doc 02 §9). It restores the per-locale
   * translation fields onto the _draft_ row, same as `content.restore()`, and — matching the exact
   * precedent that method already sets for `events` (a shared, non-per-locale sub-resource) —
   * unconditionally replaces the current shared section structure with the snapshot's, since
   * `page_sections`/`config`/`style` are locale-independent (doc 02 §8). This is a known, accepted
   * tradeoff of that shared-structure model, not something this method can avoid: recreating
   * sections from one locale's revision discards any _other_ locale's section-level content that
   * existed only on the sections being replaced, and any draft structure edits made after this
   * revision was published are lost too. `published_revision_id`/`status`/`published_at` are left
   * untouched, so the public site keeps serving whatever is currently published until an editor
   * reviews and explicitly publishes again.
   */
  async restore(
    pageId: string,
    locale: string,
    revisionId: string,
    actorUserId: string,
  ): Promise<PageTranslation> {
    return db.transaction(async (tx) => {
      const [revision] = await tx
        .select()
        .from(pageRevisions)
        .where(
          and(
            eq(pageRevisions.id, revisionId),
            eq(pageRevisions.pageId, pageId),
            eq(pageRevisions.locale, locale),
          ),
        );
      if (!revision) throw revisionNotFound(pageId, locale, revisionId);

      const snapshot = revision.snapshot as PageSnapshot;

      const [restored] = await tx
        .update(pageTranslations)
        .set({ ...snapshot.translation, status: 'DRAFT', updatedAt: new Date() })
        .where(and(eq(pageTranslations.pageId, pageId), eq(pageTranslations.locale, locale)))
        .returning();
      if (!restored) throw translationNotFound(pageId, locale);

      await tx.delete(pageSections).where(eq(pageSections.pageId, pageId));
      for (const section of snapshot.sections) {
        const [inserted] = await tx
          .insert(pageSections)
          .values({
            pageId,
            componentKey: section.componentKey,
            componentVersion: section.componentVersion,
            sortOrder: section.sortOrder,
            isVisible: section.isVisible,
            config: section.config,
            style: section.style,
          })
          .returning();
        await tx.insert(pageSectionTranslations).values({
          sectionId: inserted.id,
          locale,
          content: section.content,
        });
      }

      await tx
        .update(pages)
        .set({ lockVersion: sql`${pages.lockVersion} + 1`, updatedAt: new Date() })
        .where(eq(pages.id, pageId));

      await tx.insert(auditLogs).values({
        actorUserId,
        action: 'page.restore',
        entityType: 'page',
        entityId: pageId,
        metadata: { locale, revisionId, versionNumber: revision.versionNumber },
      });

      return restored;
    });
  }

  async listRevisions(pageId: string, locale: string): Promise<PageRevision[]> {
    return db
      .select()
      .from(pageRevisions)
      .where(and(eq(pageRevisions.pageId, pageId), eq(pageRevisions.locale, locale)))
      .orderBy(desc(pageRevisions.versionNumber));
  }
}

function validateComponentContract(input: {
  componentKey: string;
  componentVersion: number;
  content: unknown;
  config: unknown;
  style: unknown;
}) {
  try {
    return validateSection(input);
  } catch (error) {
    if (error instanceof ComponentNotRegisteredError) {
      throw new ApiError(422, 'validation_error', 'Dữ liệu không hợp lệ', error.message, [
        { field: 'componentKey', code: 'not_registered', message: error.message },
      ]);
    }
    if (error instanceof SectionValidationError) {
      throw new ApiError(
        422,
        'validation_error',
        'Dữ liệu không hợp lệ',
        'Section content/config/style failed component schema validation at publish time',
        error.issues,
      );
    }
    throw error;
  }
}

/**
 * Keeps `public_routes` pointed at this page's current path (doc 05 §11, §17), mirroring
 * `ContentPublishingService`'s `syncPublicRoute` with `targetType = 'PAGE'` instead of
 * `'CONTENT'`.
 */
async function syncPublicRoute(
  tx: Tx,
  input: { locale: string; path: string; pageId: string; actorUserId: string },
): Promise<void> {
  const [existing] = await tx
    .select()
    .from(publicRoutes)
    .where(
      and(
        eq(publicRoutes.locale, input.locale),
        eq(publicRoutes.targetType, 'PAGE'),
        eq(publicRoutes.pageId, input.pageId),
      ),
    );

  if (existing && existing.path === input.path) return;

  try {
    if (existing) {
      if (existing.path !== input.path) {
        await tx.insert(redirects).values({
          locale: input.locale,
          sourcePath: existing.path,
          destinationPath: input.path,
          statusCode: 301,
          createdBy: input.actorUserId,
        });
      }
      await tx
        .update(publicRoutes)
        .set({ path: input.path, updatedAt: new Date() })
        .where(eq(publicRoutes.id, existing.id));
    } else {
      await tx.insert(publicRoutes).values({
        locale: input.locale,
        path: input.path,
        targetType: 'PAGE',
        pageId: input.pageId,
      });
    }
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ApiError(
        409,
        'conflict',
        'Xung đột dữ liệu',
        `path "${input.path}" is already published by another page or content item in locale "${input.locale}"`,
        [{ field: 'path', code: 'duplicate', message: 'Path is already in use' }],
      );
    }
    throw error;
  }
}

function pageNotFound(id: string): ApiError {
  return new ApiError(404, 'not_found', 'Không tìm thấy tài nguyên', `Page "${id}" not found`);
}

function translationNotFound(pageId: string, locale: string): ApiError {
  return new ApiError(
    404,
    'not_found',
    'Không tìm thấy tài nguyên',
    `Page "${pageId}" has no "${locale}" translation`,
  );
}

function revisionNotFound(pageId: string, locale: string, revisionId: string): ApiError {
  return new ApiError(
    404,
    'not_found',
    'Không tìm thấy tài nguyên',
    `Revision "${revisionId}" does not belong to page "${pageId}" locale "${locale}"`,
  );
}
