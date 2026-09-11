import { Injectable } from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '../../db';
import {
  type Page,
  type PageRevision,
  type PageTranslation,
  pageRevisions,
  pages,
  pageTranslations,
} from '../../db/schema';
import type { CreatePageDto } from '../dto/create-page.dto';
import type { PageListQueryDto } from '../dto/page-list-query.dto';
import type { UpsertPageTranslationDto } from '../dto/upsert-page-translation.dto';
import type { PageSnapshot } from '../page.types';

export type PageWithTranslation = Page & { translation: PageTranslation | null };
export type PageWithRevision = Page & { publishedAt: Date | null; snapshot: PageSnapshot };

@Injectable()
export class PagesRepository {
  async listForAdmin(
    query: PageListQueryDto,
  ): Promise<{ items: PageWithTranslation[]; total: number }> {
    const conditions = [
      sql`${pages.deletedAt} IS NULL`,
      query.pageType ? eq(pages.pageType, query.pageType) : undefined,
      query.status ? eq(pageTranslations.status, query.status) : undefined,
    ].filter((c) => c !== undefined);

    const rows = await db
      .select({ item: pages, translation: pageTranslations })
      .from(pages)
      .innerJoin(
        pageTranslations,
        and(eq(pageTranslations.pageId, pages.id), eq(pageTranslations.locale, query.locale)),
      )
      .where(and(...conditions))
      .orderBy(sql`${pages.createdAt} DESC`)
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(pages)
      .innerJoin(
        pageTranslations,
        and(eq(pageTranslations.pageId, pages.id), eq(pageTranslations.locale, query.locale)),
      )
      .where(and(...conditions));

    return {
      items: rows.map((r) => ({ ...r.item, translation: r.translation })),
      total: count,
    };
  }

  async listPublished(
    query: PageListQueryDto,
  ): Promise<{ items: PageWithRevision[]; total: number }> {
    const conditions = [
      sql`${pages.deletedAt} IS NULL`,
      query.pageType ? eq(pages.pageType, query.pageType) : undefined,
    ].filter((c) => c !== undefined);

    const rows = await db
      .select({ item: pages, translation: pageTranslations, revision: pageRevisions })
      .from(pages)
      .innerJoin(
        pageTranslations,
        and(eq(pageTranslations.pageId, pages.id), eq(pageTranslations.locale, query.locale)),
      )
      .innerJoin(pageRevisions, eq(pageRevisions.id, pageTranslations.publishedRevisionId))
      .where(and(...conditions))
      .orderBy(sql`${pageTranslations.publishedAt} DESC`)
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(pages)
      .innerJoin(
        pageTranslations,
        and(eq(pageTranslations.pageId, pages.id), eq(pageTranslations.locale, query.locale)),
      )
      .where(and(...conditions));

    return {
      items: rows.map((r) => ({
        ...r.item,
        publishedAt: r.translation.publishedAt,
        snapshot: r.revision.snapshot as PageSnapshot,
      })),
      total: count,
    };
  }

  async findById(id: string): Promise<Page | undefined> {
    const [row] = await db
      .select()
      .from(pages)
      .where(and(eq(pages.id, id), sql`${pages.deletedAt} IS NULL`));
    return row;
  }

  async findTranslation(pageId: string, locale: string): Promise<PageTranslation | undefined> {
    const [row] = await db
      .select()
      .from(pageTranslations)
      .where(and(eq(pageTranslations.pageId, pageId), eq(pageTranslations.locale, locale)));
    return row;
  }

  async listTranslations(pageId: string): Promise<PageTranslation[]> {
    return db.select().from(pageTranslations).where(eq(pageTranslations.pageId, pageId));
  }

  /**
   * By-slug counterpart to `findPublishedById` — matches the currently published locale's slug,
   * never the live draft's (doc 05 §8.2, mirrors `ContentItemsRepository`).
   */
  async findPublishedBySlug(locale: string, slug: string): Promise<PageWithRevision | undefined> {
    const [row] = await db
      .select({ item: pages, translation: pageTranslations, revision: pageRevisions })
      .from(pageTranslations)
      .innerJoin(pages, eq(pages.id, pageTranslations.pageId))
      .innerJoin(pageRevisions, eq(pageRevisions.id, pageTranslations.publishedRevisionId))
      .where(
        and(
          eq(pageTranslations.locale, locale),
          sql`${pages.deletedAt} IS NULL`,
          sql`${pageRevisions.snapshot} -> 'translation' ->> 'slug' = ${slug}`,
        ),
      );
    if (!row) return undefined;
    return {
      ...row.item,
      publishedAt: row.translation.publishedAt,
      snapshot: row.revision.snapshot as PageSnapshot,
    };
  }

  async findPublishedById(id: string, locale: string): Promise<PageWithRevision | undefined> {
    const [row] = await db
      .select({ item: pages, translation: pageTranslations, revision: pageRevisions })
      .from(pages)
      .innerJoin(
        pageTranslations,
        and(eq(pageTranslations.pageId, pages.id), eq(pageTranslations.locale, locale)),
      )
      .innerJoin(pageRevisions, eq(pageRevisions.id, pageTranslations.publishedRevisionId))
      .where(and(eq(pages.id, id), sql`${pages.deletedAt} IS NULL`));
    if (!row) return undefined;
    return {
      ...row.item,
      publishedAt: row.translation.publishedAt,
      snapshot: row.revision.snapshot as PageSnapshot,
    };
  }

  async create(dto: CreatePageDto, createdBy: string): Promise<Page> {
    const [row] = await db
      .insert(pages)
      .values({ pageType: dto.pageType, createdBy, updatedBy: createdBy })
      .returning();
    return row;
  }

  async softDelete(id: string, updatedBy: string): Promise<Page | undefined> {
    const [row] = await db
      .update(pages)
      .set({ deletedAt: new Date(), updatedBy, updatedAt: new Date() })
      .where(and(eq(pages.id, id), sql`${pages.deletedAt} IS NULL`))
      .returning();
    return row;
  }

  async upsertTranslation(
    pageId: string,
    locale: string,
    dto: UpsertPageTranslationDto,
  ): Promise<PageTranslation> {
    const [row] = await db
      .insert(pageTranslations)
      .values({ pageId, locale, ...dto })
      .onConflictDoUpdate({
        target: [pageTranslations.pageId, pageTranslations.locale],
        set: { ...dto, updatedAt: new Date() },
      })
      .returning();
    return row;
  }

  async findRevision(
    pageId: string,
    locale: string,
    revisionId: string,
  ): Promise<PageRevision | undefined> {
    const [row] = await db
      .select()
      .from(pageRevisions)
      .where(
        and(
          eq(pageRevisions.id, revisionId),
          eq(pageRevisions.pageId, pageId),
          eq(pageRevisions.locale, locale),
        ),
      );
    return row;
  }
}
