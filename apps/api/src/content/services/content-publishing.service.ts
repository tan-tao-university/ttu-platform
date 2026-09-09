import { Injectable } from '@nestjs/common';
import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '../../db';
import {
  type ContentRevision,
  type ContentTranslation,
  auditLogs,
  contents,
  contentRevisions,
  contentTranslations,
  events,
  publicRoutes,
  redirects,
} from '../../db/schema';
import { ApiError } from '../../common/http/api-error';
import { isUniqueViolation } from '../../common/db/postgres-error.util';
import type { ContentSnapshot } from '../content.types';
import type { PublishContentDto } from '../dto/publish-content.dto';

/**
 * The publish/restore transaction logic design doc 06 §10-11 describes, adapted from Pages
 * to Content: validate → snapshot → immutable revision → move the published pointer → keep
 * the public route registry in sync — all in one transaction, audited, never partially
 * applied (doc 06 §19).
 */
@Injectable()
export class ContentPublishingService {
  async publish(
    contentId: string,
    locale: string,
    actorUserId: string,
    dto: PublishContentDto,
  ): Promise<{ translation: ContentTranslation; revision: ContentRevision }> {
    return db.transaction(async (tx) => {
      const [item] = await tx
        .select()
        .from(contents)
        .where(and(eq(contents.id, contentId), sql`${contents.deletedAt} IS NULL`));
      if (!item) throw contentNotFound(contentId);

      const [translation] = await tx
        .select()
        .from(contentTranslations)
        .where(
          and(eq(contentTranslations.contentId, contentId), eq(contentTranslations.locale, locale)),
        );
      if (!translation) throw translationNotFound(contentId, locale);

      const [eventRow] = await tx.select().from(events).where(eq(events.contentId, contentId));
      if (item.type === 'EVENT' && !eventRow) {
        throw new ApiError(
          422,
          'validation_error',
          'Dữ liệu không hợp lệ',
          'Event content cannot publish without event details',
          [
            {
              field: 'event',
              code: 'required',
              message: 'Set start time and location before publishing',
            },
          ],
        );
      }

      const [{ maxVersion }] = await tx
        .select({ maxVersion: sql<number>`coalesce(max(${contentRevisions.versionNumber}), 0)` })
        .from(contentRevisions)
        .where(and(eq(contentRevisions.contentId, contentId), eq(contentRevisions.locale, locale)));
      const versionNumber = maxVersion + 1;

      const snapshot: ContentSnapshot = {
        item: { type: item.type, featuredMediaId: item.featuredMediaId },
        translation: {
          slug: translation.slug,
          path: translation.path,
          title: translation.title,
          excerpt: translation.excerpt,
          body: translation.body,
          bodyFormat: translation.bodyFormat,
          seoTitle: translation.seoTitle,
          seoDescription: translation.seoDescription,
          ogTitle: translation.ogTitle,
          ogDescription: translation.ogDescription,
          ogImageId: translation.ogImageId,
          canonicalUrl: translation.canonicalUrl,
          robotsIndex: translation.robotsIndex,
          robotsFollow: translation.robotsFollow,
        },
        event: eventRow
          ? {
              startAt: eventRow.startAt,
              endAt: eventRow.endAt,
              timezone: eventRow.timezone,
              locationName: eventRow.locationName,
              locationUrl: eventRow.locationUrl,
              registrationUrl: eventRow.registrationUrl,
              isOnline: eventRow.isOnline,
            }
          : null,
      };

      const [revision] = await tx
        .insert(contentRevisions)
        .values({
          contentId,
          locale,
          versionNumber,
          snapshot,
          createdBy: actorUserId,
          publishNote: dto.publishNote,
        })
        .returning();

      const [publishedTranslation] = await tx
        .update(contentTranslations)
        .set({
          publishedRevisionId: revision.id,
          status: 'PUBLISHED',
          publishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(eq(contentTranslations.contentId, contentId), eq(contentTranslations.locale, locale)),
        )
        .returning();

      await syncPublicRoute(tx, { locale, path: translation.path, contentId, actorUserId });

      await tx.insert(auditLogs).values({
        actorUserId,
        action: 'content.publish',
        entityType: 'content',
        entityId: contentId,
        metadata: { locale, versionNumber, revisionId: revision.id },
      });

      return { translation: publishedTranslation, revision };
    });
  }

  /** Rollback never mutates the historical revision (doc 06 §11) — it copies the snapshot's
   *  editable fields back onto the *draft* row and leaves `published_revision_id`/`status`/
   *  `published_at` untouched, so the public site keeps serving whatever is currently
   *  published until an editor reviews and explicitly publishes again. */
  async restore(
    contentId: string,
    locale: string,
    revisionId: string,
    actorUserId: string,
  ): Promise<ContentTranslation> {
    return db.transaction(async (tx) => {
      const [revision] = await tx
        .select()
        .from(contentRevisions)
        .where(
          and(
            eq(contentRevisions.id, revisionId),
            eq(contentRevisions.contentId, contentId),
            eq(contentRevisions.locale, locale),
          ),
        );
      if (!revision) throw revisionNotFound(contentId, locale, revisionId);

      const snapshot = revision.snapshot as ContentSnapshot;

      const [restored] = await tx
        .update(contentTranslations)
        .set({ ...snapshot.translation, status: 'DRAFT', updatedAt: new Date() })
        .where(
          and(eq(contentTranslations.contentId, contentId), eq(contentTranslations.locale, locale)),
        )
        .returning();
      if (!restored) throw translationNotFound(contentId, locale);

      if (snapshot.event) {
        const values = { contentId, ...snapshot.event };
        await tx
          .insert(events)
          .values(values)
          .onConflictDoUpdate({ target: events.contentId, set: values });
      }

      await tx.insert(auditLogs).values({
        actorUserId,
        action: 'content.restore',
        entityType: 'content',
        entityId: contentId,
        metadata: { locale, revisionId, versionNumber: revision.versionNumber },
      });

      return restored;
    });
  }

  async listRevisions(contentId: string, locale: string): Promise<ContentRevision[]> {
    return db
      .select()
      .from(contentRevisions)
      .where(and(eq(contentRevisions.contentId, contentId), eq(contentRevisions.locale, locale)))
      .orderBy(desc(contentRevisions.versionNumber));
  }
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** Keeps `public_routes` pointed at this content item's current path (doc 05 §11, §17):
 *  updates the existing route in place when the path changed (recording a 301 redirect from
 *  the old path so shared links keep working), or inserts a new one — rejecting with 409 if
 *  the target path is already owned by a different page/content. */
async function syncPublicRoute(
  tx: Tx,
  input: { locale: string; path: string; contentId: string; actorUserId: string },
): Promise<void> {
  const [existing] = await tx
    .select()
    .from(publicRoutes)
    .where(
      and(
        eq(publicRoutes.locale, input.locale),
        eq(publicRoutes.targetType, 'CONTENT'),
        eq(publicRoutes.contentId, input.contentId),
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
        targetType: 'CONTENT',
        contentId: input.contentId,
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

function contentNotFound(id: string): ApiError {
  return new ApiError(
    404,
    'not_found',
    'Không tìm thấy tài nguyên',
    `Content item "${id}" not found`,
  );
}

function translationNotFound(contentId: string, locale: string): ApiError {
  return new ApiError(
    404,
    'not_found',
    'Không tìm thấy tài nguyên',
    `Content item "${contentId}" has no "${locale}" translation`,
  );
}

function revisionNotFound(contentId: string, locale: string, revisionId: string): ApiError {
  return new ApiError(
    404,
    'not_found',
    'Không tìm thấy tài nguyên',
    `Revision "${revisionId}" does not belong to content item "${contentId}" locale "${locale}"`,
  );
}
