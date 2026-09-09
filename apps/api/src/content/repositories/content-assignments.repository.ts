import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { db } from '../../db';
import {
  categories,
  categoryTranslations,
  contentCategoryAssignments,
  contentTagAssignments,
  tagTranslations,
  tags,
} from '../../db/schema';

export interface AssignedCategory {
  categoryId: string;
  code: string;
  isPrimary: boolean;
  name: string | null;
}

export interface AssignedTag {
  tagId: string;
  code: string | null;
  name: string | null;
}

@Injectable()
export class ContentAssignmentsRepository {
  async listCategories(contentId: string, locale: string): Promise<AssignedCategory[]> {
    const rows = await db
      .select({
        categoryId: contentCategoryAssignments.categoryId,
        code: categories.code,
        isPrimary: contentCategoryAssignments.isPrimary,
        name: categoryTranslations.name,
      })
      .from(contentCategoryAssignments)
      .innerJoin(categories, eq(categories.id, contentCategoryAssignments.categoryId))
      .leftJoin(
        categoryTranslations,
        and(
          eq(categoryTranslations.categoryId, categories.id),
          eq(categoryTranslations.locale, locale),
        ),
      )
      .where(eq(contentCategoryAssignments.contentId, contentId));
    return rows;
  }

  async listTags(contentId: string, locale: string): Promise<AssignedTag[]> {
    const rows = await db
      .select({ tagId: contentTagAssignments.tagId, code: tags.code, name: tagTranslations.name })
      .from(contentTagAssignments)
      .innerJoin(tags, eq(tags.id, contentTagAssignments.tagId))
      .leftJoin(
        tagTranslations,
        and(eq(tagTranslations.tagId, tags.id), eq(tagTranslations.locale, locale)),
      )
      .where(eq(contentTagAssignments.contentId, contentId));
    return rows;
  }

  async assignCategory(contentId: string, categoryId: string, isPrimary: boolean): Promise<void> {
    await db.transaction(async (tx) => {
      // A content item has at most one primary category (design doc 05 §9.5,
      // `uq_content_primary_category`) — clear any existing primary flag first so setting a
      // new one never collides with it instead of surfacing a confusing 409.
      if (isPrimary) {
        await tx
          .update(contentCategoryAssignments)
          .set({ isPrimary: false })
          .where(eq(contentCategoryAssignments.contentId, contentId));
      }
      await tx
        .insert(contentCategoryAssignments)
        .values({ contentId, categoryId, isPrimary })
        .onConflictDoUpdate({
          target: [contentCategoryAssignments.contentId, contentCategoryAssignments.categoryId],
          set: { isPrimary },
        });
    });
  }

  async unassignCategory(contentId: string, categoryId: string): Promise<boolean> {
    const rows = await db
      .delete(contentCategoryAssignments)
      .where(
        and(
          eq(contentCategoryAssignments.contentId, contentId),
          eq(contentCategoryAssignments.categoryId, categoryId),
        ),
      )
      .returning();
    return rows.length > 0;
  }

  async assignTag(contentId: string, tagId: string): Promise<void> {
    await db.insert(contentTagAssignments).values({ contentId, tagId }).onConflictDoNothing();
  }

  async unassignTag(contentId: string, tagId: string): Promise<boolean> {
    const rows = await db
      .delete(contentTagAssignments)
      .where(
        and(eq(contentTagAssignments.contentId, contentId), eq(contentTagAssignments.tagId, tagId)),
      )
      .returning();
    return rows.length > 0;
  }
}
