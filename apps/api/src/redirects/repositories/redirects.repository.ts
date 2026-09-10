import { Injectable } from '@nestjs/common';
import { and, desc, eq, isNull, or, sql } from 'drizzle-orm';
import { db } from '../../db';
import { type NewRedirect, type Redirect, publicRoutes, redirects } from '../../db/schema';
import type { RedirectListQueryDto } from '../dto/redirect-list-query.dto';

@Injectable()
export class RedirectsRepository {
  async list(query: RedirectListQueryDto): Promise<{ items: Redirect[]; total: number }> {
    const conditions = [
      query.locale !== undefined ? eq(redirects.locale, query.locale) : undefined,
      query.isActive !== undefined ? eq(redirects.isActive, query.isActive) : undefined,
      query.sourcePath !== undefined ? eq(redirects.sourcePath, query.sourcePath) : undefined,
    ].filter((c) => c !== undefined);
    const where = conditions.length ? and(...conditions) : undefined;

    const [items, [{ count }]] = await Promise.all([
      db
        .select()
        .from(redirects)
        .where(where)
        .orderBy(desc(redirects.createdAt))
        .limit(query.pageSize)
        .offset((query.page - 1) * query.pageSize),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(redirects)
        .where(where),
    ]);

    return { items, total: count };
  }

  async findById(id: string): Promise<Redirect | undefined> {
    const [row] = await db.select().from(redirects).where(eq(redirects.id, id));
    return row;
  }

  /**
   * Doc 05 §12.1's resolution precedence for a given `locale`: a locale-specific active redirect
   * takes priority over the global (`locale IS NULL`) fallback tier, but both are real conflict
   * candidates a new redirect for that `locale` could collide or chain with. A caller creating a
   * _global_ redirect (`locale === null`) only conflicts with other global rows - it is never
   * compared against one specific locale's rules.
   */
  async findActiveMatchesForLocale(locale: string | null, sourcePath: string): Promise<Redirect[]> {
    const localeCondition =
      locale === null
        ? isNull(redirects.locale)
        : or(eq(redirects.locale, locale), isNull(redirects.locale));
    return db
      .select()
      .from(redirects)
      .where(
        and(eq(redirects.isActive, true), eq(redirects.sourcePath, sourcePath), localeCondition),
      );
  }

  async findActiveBySourceAndDestination(
    locale: string | null,
    sourcePath: string,
    destinationPath: string,
  ): Promise<Redirect | undefined> {
    const rows = await this.findActiveMatchesForLocale(locale, sourcePath);
    return rows.find((row) => row.destinationPath === destinationPath);
  }

  /** Doc 05 §12.1: a redirect must never shadow a path `public_routes` currently serves live. */
  async hasLivePublicRoute(locale: string | null, path: string): Promise<boolean> {
    const condition =
      locale === null
        ? eq(publicRoutes.path, path)
        : and(eq(publicRoutes.locale, locale), eq(publicRoutes.path, path));
    const [row] = await db
      .select({ id: publicRoutes.id })
      .from(publicRoutes)
      .where(condition)
      .limit(1);
    return row !== undefined;
  }

  async create(dto: NewRedirect): Promise<Redirect> {
    const [row] = await db.insert(redirects).values(dto).returning();
    return row;
  }

  async update(
    id: string,
    dto: Partial<Pick<Redirect, 'destinationPath' | 'statusCode' | 'isActive'>>,
  ): Promise<Redirect | undefined> {
    const [row] = await db
      .update(redirects)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(redirects.id, id))
      .returning();
    return row;
  }

  async remove(id: string): Promise<Redirect | undefined> {
    const [row] = await db.delete(redirects).where(eq(redirects.id, id)).returning();
    return row;
  }
}
