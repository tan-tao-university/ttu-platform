import { Injectable } from '@nestjs/common';
import type { z } from 'zod';
import { ApiError, type ApiErrorDetail } from '../../common/http/api-error';
import type { SiteSetting } from '../../db/schema';
import type { UpsertSiteSettingDto } from '../dto/upsert-site-setting.dto';
import { SiteSettingsRepository } from '../repositories/site-settings.repository';
import { SETTINGS_CATALOG } from '../settings.catalog';

/**
 * Every setting key is public-safe by design (doc 05 §12.2's four example keys are all things the
 * public website itself needs to render - contact info, social links, SEO fallbacks, feature
 * toggles), and `site_settings` holds one current value per key with no draft/published split to
 * hide from an unprivileged caller. So unlike `content`/`pages`/`menus`, there is nothing here for
 * an RBAC-branched read to protect - `SiteSettingsController`'s reads are unauthenticated; only the
 * write requires `settings.manage`.
 */
@Injectable()
export class SiteSettingsService {
  constructor(private readonly settings: SiteSettingsRepository) {}

  async list(): Promise<SiteSetting[]> {
    return this.settings.list();
  }

  async findByKey(key: string): Promise<SiteSetting> {
    requireCatalogEntry(key);
    const row = await this.settings.findByKey(key);
    if (!row) throw settingNotSet(key);
    return row;
  }

  async upsert(key: string, dto: UpsertSiteSettingDto, updatedBy: string): Promise<SiteSetting> {
    const entry = requireCatalogEntry(key);
    const issues = collectIssues(entry.schema, dto.value);
    if (issues.length > 0) {
      throw new ApiError(
        422,
        'validation_error',
        'Dữ liệu không hợp lệ',
        `Value for setting "${key}" does not match its schema`,
        issues,
      );
    }

    const validated = entry.schema.parse(dto.value);
    return this.settings.upsert(key, validated, updatedBy);
  }
}

function requireCatalogEntry(key: string): (typeof SETTINGS_CATALOG)[string] {
  const entry = SETTINGS_CATALOG[key];
  if (!entry) {
    throw new ApiError(
      404,
      'not_found',
      'Không tìm thấy tài nguyên',
      `Unknown setting key "${key}"`,
    );
  }
  return entry;
}

function settingNotSet(key: string): ApiError {
  return new ApiError(
    404,
    'not_found',
    'Không tìm thấy tài nguyên',
    `Setting "${key}" is a known key but has never been set`,
  );
}

function collectIssues(schema: z.ZodType<unknown>, value: unknown): ApiErrorDetail[] {
  const result = schema.safeParse(value);
  if (result.success) return [];
  return result.error.issues.flatMap((issue): ApiErrorDetail[] => {
    if (issue.code === 'unrecognized_keys') {
      return issue.keys.map((key) => ({
        field: ['value', key].join('.'),
        code: issue.code,
        message: `Unrecognized field "${key}"`,
      }));
    }
    return [
      {
        field: ['value', ...issue.path.map(String)].join('.'),
        code: issue.code,
        message: issue.message,
      },
    ];
  });
}
