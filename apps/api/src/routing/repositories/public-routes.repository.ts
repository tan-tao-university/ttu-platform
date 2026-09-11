import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { db } from '../../db';
import { type PublicRoute, publicRoutes } from '../../db/schema';

@Injectable()
export class PublicRoutesRepository {
  async findByLocaleAndPath(locale: string, path: string): Promise<PublicRoute | undefined> {
    const [row] = await db
      .select()
      .from(publicRoutes)
      .where(and(eq(publicRoutes.locale, locale), eq(publicRoutes.path, path)));
    return row;
  }
}
