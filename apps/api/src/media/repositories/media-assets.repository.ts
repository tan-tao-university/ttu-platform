import { Injectable } from '@nestjs/common';
import { and, eq, ilike, or, sql } from 'drizzle-orm';
import { db } from '../../db';
import {
  type MediaAsset,
  type MediaTranslation,
  contents,
  contentTranslations,
  mediaAssets,
  mediaTranslations,
  partners,
  people,
} from '../../db/schema';
import type { AdminMediaListQueryDto } from '../dto/admin-media-list-query.dto';
import type { UpsertMediaTranslationDto } from '../dto/upsert-media-translation.dto';

export interface NewMediaAssetInput {
  bucket: string;
  storageKey: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  width: number | null;
  height: number | null;
  checksumSha256: string;
  uploadedBy: string;
}

@Injectable()
export class MediaAssetsRepository {
  async listForAdmin(
    query: AdminMediaListQueryDto,
  ): Promise<{ items: MediaAsset[]; total: number }> {
    const conditions = [
      sql`${mediaAssets.deletedAt} IS NULL`,
      query.mimeType ? eq(mediaAssets.mimeType, query.mimeType) : undefined,
      query.search ? ilike(mediaAssets.originalFileName, `%${query.search}%`) : undefined,
    ].filter((c) => c !== undefined);

    const [items, [{ count }]] = await Promise.all([
      db
        .select()
        .from(mediaAssets)
        .where(and(...conditions))
        .orderBy(sql`${mediaAssets.createdAt} DESC`)
        .limit(query.pageSize)
        .offset((query.page - 1) * query.pageSize),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(mediaAssets)
        .where(and(...conditions)),
    ]);

    return { items, total: count };
  }

  async findById(id: string): Promise<MediaAsset | undefined> {
    const [row] = await db
      .select()
      .from(mediaAssets)
      .where(and(eq(mediaAssets.id, id), sql`${mediaAssets.deletedAt} IS NULL`));
    return row;
  }

  async listTranslations(mediaId: string): Promise<MediaTranslation[]> {
    return db.select().from(mediaTranslations).where(eq(mediaTranslations.mediaId, mediaId));
  }

  async create(input: NewMediaAssetInput): Promise<MediaAsset> {
    const [row] = await db.insert(mediaAssets).values(input).returning();
    return row;
  }

  async softDelete(id: string): Promise<MediaAsset | undefined> {
    const [row] = await db
      .update(mediaAssets)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(mediaAssets.id, id), sql`${mediaAssets.deletedAt} IS NULL`))
      .returning();
    return row;
  }

  async restore(id: string): Promise<MediaAsset | undefined> {
    const [row] = await db
      .update(mediaAssets)
      .set({ deletedAt: null, updatedAt: new Date() })
      .where(and(eq(mediaAssets.id, id), sql`${mediaAssets.deletedAt} IS NOT NULL`))
      .returning();
    return row;
  }

  async upsertTranslation(
    mediaId: string,
    locale: string,
    dto: UpsertMediaTranslationDto,
  ): Promise<MediaTranslation> {
    const values = { mediaId, locale, altText: dto.altText, caption: dto.caption };
    const [row] = await db
      .insert(mediaTranslations)
      .values(values)
      .onConflictDoUpdate({
        target: [mediaTranslations.mediaId, mediaTranslations.locale],
        set: { altText: dto.altText, caption: dto.caption },
      })
      .returning();
    return row;
  }

  /**
   * Doc 08 §17: deletion is blocked only while the asset is still reachable from _live_ data —
   * `contents.featured_media_id`/`content_translations.og_image_id` on a locale that has actually
   * been published (draft-only references don't block: doc 06 §9's "Draft không ảnh hưởng public
   * website" cuts both ways), or an active `people`/`partners` profile — those two have no separate
   * draft/publish state to check against (doc 01 §8.2/§8.4).
   */
  async isReferenced(mediaId: string): Promise<boolean> {
    const [publishedContentRef] = await db
      .select({ id: contents.id })
      .from(contents)
      .innerJoin(
        contentTranslations,
        and(
          eq(contentTranslations.contentId, contents.id),
          sql`${contentTranslations.publishedRevisionId} IS NOT NULL`,
        ),
      )
      .where(
        and(
          sql`${contents.deletedAt} IS NULL`,
          or(eq(contents.featuredMediaId, mediaId), eq(contentTranslations.ogImageId, mediaId)),
        ),
      )
      .limit(1);
    if (publishedContentRef) return true;

    const [activePersonRef] = await db
      .select({ id: people.id })
      .from(people)
      .where(and(eq(people.portraitMediaId, mediaId), eq(people.isActive, true)))
      .limit(1);
    if (activePersonRef) return true;

    const [activePartnerRef] = await db
      .select({ id: partners.id })
      .from(partners)
      .where(and(eq(partners.logoMediaId, mediaId), eq(partners.isActive, true)))
      .limit(1);
    return !!activePartnerRef;
  }
}
