import { Injectable } from '@nestjs/common';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { db } from '../../db';
import {
  type PageSection,
  type PageSectionTranslation,
  pages,
  pageSections,
  pageSectionTranslations,
} from '../../db/schema';

export type PageSectionWithTranslations = PageSection & { translations: PageSectionTranslation[] };

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

const LOCK_CONFLICT = Symbol('page-sections:lock-conflict');
type LockConflict = typeof LOCK_CONFLICT;

@Injectable()
export class PageSectionsRepository {
  async findById(id: string): Promise<PageSection | undefined> {
    const [row] = await db.select().from(pageSections).where(eq(pageSections.id, id));
    return row;
  }

  /**
   * Flat, ordered by `sortOrder` — same shape `MenusRepository.listItemsWithTranslations` uses; the
   * Admin Page Editor assembles the visual list client-side.
   */
  async listByPage(pageId: string): Promise<PageSection[]> {
    return db
      .select()
      .from(pageSections)
      .where(eq(pageSections.pageId, pageId))
      .orderBy(pageSections.sortOrder);
  }

  async listWithTranslations(pageId: string): Promise<PageSectionWithTranslations[]> {
    const sections = await this.listByPage(pageId);
    if (sections.length === 0) return [];
    const translations = await db
      .select()
      .from(pageSectionTranslations)
      .where(
        inArray(
          pageSectionTranslations.sectionId,
          sections.map((s) => s.id),
        ),
      );
    const bySection = new Map<string, PageSectionTranslation[]>();
    for (const row of translations) {
      const list = bySection.get(row.sectionId) ?? [];
      list.push(row);
      bySection.set(row.sectionId, list);
    }
    return sections.map((section) => ({
      ...section,
      translations: bySection.get(section.id) ?? [],
    }));
  }

  async findTranslation(
    sectionId: string,
    locale: string,
  ): Promise<PageSectionTranslation | undefined> {
    const [row] = await db
      .select()
      .from(pageSectionTranslations)
      .where(
        and(
          eq(pageSectionTranslations.sectionId, sectionId),
          eq(pageSectionTranslations.locale, locale),
        ),
      );
    return row;
  }

  /**
   * Every section's translation for one locale, ordered — the shape `PagePublishingService`
   * snapshots.
   */
  async listWithTranslationForLocale(
    pageId: string,
    locale: string,
  ): Promise<Array<{ section: PageSection; translation: PageSectionTranslation | undefined }>> {
    const sections = await this.listByPage(pageId);
    if (sections.length === 0) return [];
    const translations = await db
      .select()
      .from(pageSectionTranslations)
      .where(
        and(
          inArray(
            pageSectionTranslations.sectionId,
            sections.map((s) => s.id),
          ),
          eq(pageSectionTranslations.locale, locale),
        ),
      );
    const byId = new Map(translations.map((t) => [t.sectionId, t]));
    return sections.map((section) => ({ section, translation: byId.get(section.id) }));
  }

  /**
   * Design doc 06 §14's optimistic-concurrency pattern, scoped to the page's shared section
   * structure (`pages.lock_version`): every structural mutation atomically checks the caller's
   * `expectedLockVersion` and bumps it in the same transaction the mutation runs in. Returns
   * `undefined` if the lock was stale — the caller loaded an out-of-date structure and must refresh
   * before retrying, never silently overwriting someone else's concurrent change.
   */
  async createWithLock(
    pageId: string,
    expectedLockVersion: number,
    values: {
      componentKey: string;
      componentVersion: number;
      sortOrder: number;
      isVisible: boolean;
      config: Record<string, unknown>;
      style: Record<string, unknown>;
    },
  ): Promise<PageSection | undefined> {
    return db.transaction(async (tx: Tx) => {
      const locked = await bumpLock(tx, pageId, expectedLockVersion);
      if (locked === LOCK_CONFLICT) return undefined;
      const [row] = await tx
        .insert(pageSections)
        .values({ pageId, ...values })
        .returning();
      return row;
    });
  }

  async updateWithLock(
    id: string,
    pageId: string,
    expectedLockVersion: number,
    patch: Partial<{
      sortOrder: number;
      isVisible: boolean;
      config: Record<string, unknown>;
      style: Record<string, unknown>;
    }>,
  ): Promise<PageSection | undefined | LockConflict> {
    return db.transaction(async (tx: Tx) => {
      const locked = await bumpLock(tx, pageId, expectedLockVersion);
      if (locked === LOCK_CONFLICT) return LOCK_CONFLICT;
      const [row] = await tx
        .update(pageSections)
        .set({ ...patch, updatedAt: new Date() })
        .where(eq(pageSections.id, id))
        .returning();
      return row;
    });
  }

  async removeWithLock(
    id: string,
    pageId: string,
    expectedLockVersion: number,
  ): Promise<PageSection | undefined | LockConflict> {
    return db.transaction(async (tx: Tx) => {
      const locked = await bumpLock(tx, pageId, expectedLockVersion);
      if (locked === LOCK_CONFLICT) return LOCK_CONFLICT;
      const [row] = await tx.delete(pageSections).where(eq(pageSections.id, id)).returning();
      return row;
    });
  }

  async reorderWithLock(
    pageId: string,
    expectedLockVersion: number,
    orderedIds: string[],
  ): Promise<true | LockConflict> {
    return db.transaction(async (tx: Tx) => {
      const locked = await bumpLock(tx, pageId, expectedLockVersion);
      if (locked === LOCK_CONFLICT) return LOCK_CONFLICT;
      for (const [index, id] of orderedIds.entries()) {
        await tx
          .update(pageSections)
          .set({ sortOrder: index, updatedAt: new Date() })
          .where(and(eq(pageSections.id, id), eq(pageSections.pageId, pageId)));
      }
      return true;
    });
  }

  async upsertTranslation(
    sectionId: string,
    locale: string,
    content: Record<string, unknown>,
  ): Promise<PageSectionTranslation> {
    const [row] = await db
      .insert(pageSectionTranslations)
      .values({ sectionId, locale, content })
      .onConflictDoUpdate({
        target: [pageSectionTranslations.sectionId, pageSectionTranslations.locale],
        set: { content, updatedAt: new Date() },
      })
      .returning();
    return row;
  }
}

async function bumpLock(
  tx: Tx,
  pageId: string,
  expectedLockVersion: number,
): Promise<number | LockConflict> {
  const [row] = await tx
    .update(pages)
    .set({ lockVersion: sql`${pages.lockVersion} + 1`, updatedAt: new Date() })
    .where(and(eq(pages.id, pageId), eq(pages.lockVersion, expectedLockVersion)))
    .returning({ lockVersion: pages.lockVersion });
  return row ? row.lockVersion : LOCK_CONFLICT;
}

export { LOCK_CONFLICT, type LockConflict };
