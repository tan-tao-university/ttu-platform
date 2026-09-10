import { IsOptional, IsString, Length } from 'class-validator';

/**
 * `customPath` is only meaningful for `linkType = CUSTOM_PATH` items; the DB has no cross-table way
 * to enforce that (it lives on the parent `menu_items` row, this on the translation row), so it is
 * accepted unconditionally here — an admin UI only shows it for that link type in practice.
 */
export class UpsertMenuItemTranslationDto {
  @IsString()
  @Length(1, 255)
  label!: string;

  @IsOptional()
  @IsString()
  @Length(1, 2000)
  customPath?: string;
}
