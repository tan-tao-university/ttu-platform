import { Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { db } from '../../db';
import { type Tag, tagTranslations, tags } from '../../db/schema';
import type { CreateTagDto } from '../dto/create-tag.dto';
import type { TagListQueryDto } from '../dto/tag-list-query.dto';
import type { UpdateTagDto } from '../dto/update-tag.dto';
import type { UpsertTagTranslationDto } from '../dto/upsert-tag-translation.dto';

export interface TagTranslationRow {
  locale: string;
  name: string;
  slug: string;
}

export type TagWithTranslations = Tag & { translations: TagTranslationRow[] };

@Injectable()
export class TagsRepository {
  async list(query: TagListQueryDto): Promise<{ items: Tag[]; total: number }> {
    const where = query.isActive !== undefined ? eq(tags.isActive, query.isActive) : undefined;

    const [items, [{ count }]] = await Promise.all([
      db
        .select()
        .from(tags)
        .where(where)
        .orderBy(tags.createdAt)
        .limit(query.pageSize)
        .offset((query.page - 1) * query.pageSize),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(tags)
        .where(where),
    ]);

    return { items, total: count };
  }

  async findById(id: string): Promise<TagWithTranslations | undefined> {
    const [tag] = await db.select().from(tags).where(eq(tags.id, id));
    if (!tag) return undefined;

    const translations = await db
      .select({
        locale: tagTranslations.locale,
        name: tagTranslations.name,
        slug: tagTranslations.slug,
      })
      .from(tagTranslations)
      .where(eq(tagTranslations.tagId, id));

    return { ...tag, translations };
  }

  async create(dto: CreateTagDto): Promise<Tag> {
    const [row] = await db.insert(tags).values(dto).returning();
    return row;
  }

  async update(id: string, dto: UpdateTagDto): Promise<Tag | undefined> {
    const [row] = await db
      .update(tags)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(tags.id, id))
      .returning();
    return row;
  }

  async remove(id: string): Promise<Tag | undefined> {
    const [row] = await db.delete(tags).where(eq(tags.id, id)).returning();
    return row;
  }

  async upsertTranslation(
    tagId: string,
    locale: string,
    dto: UpsertTagTranslationDto,
  ): Promise<TagTranslationRow> {
    const [row] = await db
      .insert(tagTranslations)
      .values({ tagId, locale, ...dto })
      .onConflictDoUpdate({
        target: [tagTranslations.tagId, tagTranslations.locale],
        set: { name: dto.name, slug: dto.slug },
      })
      .returning({
        locale: tagTranslations.locale,
        name: tagTranslations.name,
        slug: tagTranslations.slug,
      });
    return row;
  }
}
