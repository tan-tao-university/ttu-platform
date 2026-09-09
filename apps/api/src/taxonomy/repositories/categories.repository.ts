import { Injectable } from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '../../db';
import { type Category, categories, categoryTranslations } from '../../db/schema';
import type { CategoryListQueryDto } from '../dto/category-list-query.dto';
import type { CreateCategoryDto } from '../dto/create-category.dto';
import type { UpdateCategoryDto } from '../dto/update-category.dto';
import type { UpsertCategoryTranslationDto } from '../dto/upsert-category-translation.dto';

export interface CategoryTranslationRow {
  locale: string;
  name: string;
  slug: string;
  description: string | null;
}

export type CategoryWithTranslations = Category & { translations: CategoryTranslationRow[] };

@Injectable()
export class CategoriesRepository {
  async list(query: CategoryListQueryDto): Promise<{ items: Category[]; total: number }> {
    const conditions = [
      query.parentId ? eq(categories.parentId, query.parentId) : undefined,
      query.isActive !== undefined ? eq(categories.isActive, query.isActive) : undefined,
    ].filter((c) => c !== undefined);
    const where = conditions.length ? and(...conditions) : undefined;

    const [items, [{ count }]] = await Promise.all([
      db
        .select()
        .from(categories)
        .where(where)
        .orderBy(categories.sortOrder)
        .limit(query.pageSize)
        .offset((query.page - 1) * query.pageSize),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(categories)
        .where(where),
    ]);

    return { items, total: count };
  }

  async findById(id: string): Promise<CategoryWithTranslations | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    if (!category) return undefined;

    const translations = await db
      .select({
        locale: categoryTranslations.locale,
        name: categoryTranslations.name,
        slug: categoryTranslations.slug,
        description: categoryTranslations.description,
      })
      .from(categoryTranslations)
      .where(eq(categoryTranslations.categoryId, id));

    return { ...category, translations };
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const [row] = await db
      .insert(categories)
      .values({
        code: dto.code,
        parentId: dto.parentId,
        sortOrder: dto.sortOrder,
        isActive: dto.isActive,
      })
      .returning();
    return row;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category | undefined> {
    const [row] = await db
      .update(categories)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return row;
  }

  async remove(id: string): Promise<Category | undefined> {
    const [row] = await db.delete(categories).where(eq(categories.id, id)).returning();
    return row;
  }

  async upsertTranslation(
    categoryId: string,
    locale: string,
    dto: UpsertCategoryTranslationDto,
  ): Promise<CategoryTranslationRow> {
    const [row] = await db
      .insert(categoryTranslations)
      .values({ categoryId, locale, ...dto })
      .onConflictDoUpdate({
        target: [categoryTranslations.categoryId, categoryTranslations.locale],
        set: { name: dto.name, slug: dto.slug, description: dto.description },
      })
      .returning({
        locale: categoryTranslations.locale,
        name: categoryTranslations.name,
        slug: categoryTranslations.slug,
        description: categoryTranslations.description,
      });
    return row;
  }
}
