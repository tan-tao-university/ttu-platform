import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { type SiteSetting, siteSettings } from '../../db/schema';

@Injectable()
export class SiteSettingsRepository {
  async list(): Promise<SiteSetting[]> {
    return db.select().from(siteSettings).orderBy(siteSettings.key);
  }

  async findByKey(key: string): Promise<SiteSetting | undefined> {
    const [row] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return row;
  }

  async upsert(key: string, value: unknown, updatedBy: string | null): Promise<SiteSetting> {
    const [row] = await db
      .insert(siteSettings)
      .values({ key, value, updatedBy, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value, updatedBy, updatedAt: new Date() },
      })
      .returning();
    return row;
  }
}
