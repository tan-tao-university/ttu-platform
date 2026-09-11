import { IsObject } from 'class-validator';

/**
 * `value`'s actual shape is not fixed by class-validator - it is validated against the matching
 * `SETTINGS_CATALOG[key].schema` in `SiteSettingsService`, since each key has its own Zod
 * contract.
 */
export class UpsertSiteSettingDto {
  @IsObject()
  value!: Record<string, unknown>;
}
