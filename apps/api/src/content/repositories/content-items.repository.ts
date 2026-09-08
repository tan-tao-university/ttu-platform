import { Injectable } from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '../../db';
import {
  type ContentItem,
  type ContentTranslation,
  type Event,
  contentItems,
  contentRevisions,
  contentTranslations,
  events,
} from '../../db/schema';
import type { AdminContentListQueryDto } from '../dto/admin-content-list-query.dto';
import type { CreateContentItemDto } from '../dto/create-content-item.dto';
import type { PublicContentListQueryDto } from '../dto/public-content-list-query.dto';
import type { UpdateContentItemDto } from '../dto/update-content-item.dto';
import type { UpsertContentTranslationDto } from '../dto/upsert-content-translation.dto';
import type { UpsertEventDto } from '../dto/upsert-event.dto';
import type { ContentSnapshot } from '../content.types';

export type ContentItemWithTranslation = ContentItem & { translation: ContentTranslation | null };

/** The public read shape: a content item plus the currently-published revision's
 *  snapshot — never the live draft translation columns (see `listPublished` below). */
export type ContentItemWithRevision = ContentItem & {
  publishedAt: Date | null;
  snapshot: ContentSnapshot;
};

@Injectable()
export class ContentItemsRepository {
  async listForAdmin(
    query: AdminContentListQueryDto,
  ): Promise<{ items: ContentItemWithTranslation[]; total: number }> {
    const conditions = [
      sql`${contentItems.deletedAt} IS NULL`,
      query.type ? eq(contentItems.type, query.type) : undefined,
      query.status ? eq(contentTranslations.status, query.status) : undefined,
    ].filter((c) => c !== undefined);

    const rows = await db
      .select({ item: contentItems, translation: contentTranslations })
      .from(contentItems)
      .innerJoin(
        contentTranslations,
        and(
          eq(contentTranslations.contentId, contentItems.id),
          eq(contentTranslations.locale, query.locale),
        ),
      )
      .where(and(...conditions))
      .orderBy(sql`${contentItems.createdAt} DESC`)
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(contentItems)
      .innerJoin(
        contentTranslations,
        and(
          eq(contentTranslations.contentId, contentItems.id),
          eq(contentTranslations.locale, query.locale),
        ),
      )
      .where(and(...conditions));

    return { items: rows.map((r) => ({ ...r.item, translation: r.translation })), total: count };
  }

  /** Reads from `content_revisions.snapshot`, never live `content_translations` columns —
   *  editing a draft after publish must not change what the public sees (doc 06 §9, doc 02
   *  §9: "Draft không ảnh hưởng public website"). `publishedAt` still comes from
   *  `content_translations` since it is set exactly at publish time and untouched by draft
   *  edits. Visibility is gated by the `INNER JOIN` on `publishedRevisionId` below, never by
   *  `status` — `status` is an editorial-workflow indicator only (e.g. `restore` resets it
   *  to `DRAFT` to prompt review, but must not un-publish the still-live revision; doc 06
   *  §11).
   */
  async listPublished(
    query: PublicContentListQueryDto,
  ): Promise<{ items: ContentItemWithRevision[]; total: number }> {
    const conditions = [
      sql`${contentItems.deletedAt} IS NULL`,
      query.type ? eq(contentItems.type, query.type) : undefined,
    ].filter((c) => c !== undefined);

    const rows = await db
      .select({ item: contentItems, translation: contentTranslations, revision: contentRevisions })
      .from(contentItems)
      .innerJoin(
        contentTranslations,
        and(
          eq(contentTranslations.contentId, contentItems.id),
          eq(contentTranslations.locale, query.locale),
        ),
      )
      .innerJoin(contentRevisions, eq(contentRevisions.id, contentTranslations.publishedRevisionId))
      .where(and(...conditions))
      .orderBy(sql`${contentTranslations.publishedAt} DESC`)
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(contentItems)
      .innerJoin(
        contentTranslations,
        and(
          eq(contentTranslations.contentId, contentItems.id),
          eq(contentTranslations.locale, query.locale),
        ),
      )
      .where(and(...conditions));

    return {
      items: rows.map((r) => ({
        ...r.item,
        publishedAt: r.translation.publishedAt,
        snapshot: r.revision.snapshot as ContentSnapshot,
      })),
      total: count,
    };
  }

  async findById(id: string): Promise<ContentItem | undefined> {
    const [row] = await db
      .select()
      .from(contentItems)
      .where(and(eq(contentItems.id, id), sql`${contentItems.deletedAt} IS NULL`));
    return row;
  }

  async findTranslation(
    contentId: string,
    locale: string,
  ): Promise<ContentTranslation | undefined> {
    const [row] = await db
      .select()
      .from(contentTranslations)
      .where(
        and(eq(contentTranslations.contentId, contentId), eq(contentTranslations.locale, locale)),
      );
    return row;
  }

  async listTranslations(contentId: string): Promise<ContentTranslation[]> {
    return db
      .select()
      .from(contentTranslations)
      .where(eq(contentTranslations.contentId, contentId));
  }

  /** Matches the *published* slug (inside the revision snapshot), not the live draft slug —
   *  same reasoning as `listPublished` above. A draft mid-edit with a different slug must
   *  not 404 the still-published old slug, and must not resolve at its not-yet-published
   *  new one either. */
  async findPublishedBySlug(
    locale: string,
    slug: string,
  ): Promise<ContentItemWithRevision | undefined> {
    const [row] = await db
      .select({ item: contentItems, translation: contentTranslations, revision: contentRevisions })
      .from(contentTranslations)
      .innerJoin(contentItems, eq(contentItems.id, contentTranslations.contentId))
      .innerJoin(contentRevisions, eq(contentRevisions.id, contentTranslations.publishedRevisionId))
      .where(
        and(
          eq(contentTranslations.locale, locale),
          sql`${contentItems.deletedAt} IS NULL`,
          sql`${contentRevisions.snapshot} -> 'translation' ->> 'slug' = ${slug}`,
        ),
      );
    if (!row) return undefined;
    return {
      ...row.item,
      publishedAt: row.translation.publishedAt,
      snapshot: row.revision.snapshot as ContentSnapshot,
    };
  }

  async findEvent(contentId: string): Promise<Event | undefined> {
    const [row] = await db.select().from(events).where(eq(events.contentId, contentId));
    return row;
  }

  async create(dto: CreateContentItemDto, createdBy: string): Promise<ContentItem> {
    const [row] = await db
      .insert(contentItems)
      .values({
        type: dto.type,
        featuredMediaId: dto.featuredMediaId,
        createdBy,
        updatedBy: createdBy,
      })
      .returning();
    return row;
  }

  async update(
    id: string,
    dto: UpdateContentItemDto,
    updatedBy: string,
  ): Promise<ContentItem | undefined> {
    const [row] = await db
      .update(contentItems)
      .set({ ...dto, updatedBy, updatedAt: new Date() })
      .where(eq(contentItems.id, id))
      .returning();
    return row;
  }

  async softDelete(id: string, updatedBy: string): Promise<ContentItem | undefined> {
    const [row] = await db
      .update(contentItems)
      .set({ deletedAt: new Date(), updatedBy, updatedAt: new Date() })
      .where(and(eq(contentItems.id, id), sql`${contentItems.deletedAt} IS NULL`))
      .returning();
    return row;
  }

  async upsertTranslation(
    contentId: string,
    locale: string,
    dto: UpsertContentTranslationDto,
  ): Promise<ContentTranslation> {
    const [row] = await db
      .insert(contentTranslations)
      .values({ contentId, locale, ...dto, path: dto.path })
      .onConflictDoUpdate({
        target: [contentTranslations.contentId, contentTranslations.locale],
        set: {
          slug: dto.slug,
          path: dto.path,
          title: dto.title,
          excerpt: dto.excerpt,
          body: dto.body,
          bodyFormat: dto.bodyFormat,
          seoTitle: dto.seoTitle,
          seoDescription: dto.seoDescription,
          ogTitle: dto.ogTitle,
          ogDescription: dto.ogDescription,
          ogImageId: dto.ogImageId,
          canonicalUrl: dto.canonicalUrl,
          robotsIndex: dto.robotsIndex,
          robotsFollow: dto.robotsFollow,
          updatedAt: new Date(),
        },
      })
      .returning();
    return row;
  }

  async upsertEvent(contentId: string, dto: UpsertEventDto): Promise<Event> {
    const values = {
      contentId,
      startAt: new Date(dto.startAt),
      endAt: dto.endAt ? new Date(dto.endAt) : undefined,
      timezone: dto.timezone,
      locationName: dto.locationName,
      locationUrl: dto.locationUrl,
      registrationUrl: dto.registrationUrl,
      isOnline: dto.isOnline,
    };
    const [row] = await db
      .insert(events)
      .values(values)
      .onConflictDoUpdate({ target: events.contentId, set: values })
      .returning();
    return row;
  }
}
