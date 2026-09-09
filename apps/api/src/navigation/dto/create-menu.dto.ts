import { IsBoolean, IsOptional, Length, Matches } from 'class-validator';

/**
 * `key` is the stable, machine-readable identifier frontends address a navigation context by
 * (`main-header`, `footer`, `quick-links` — doc 01 §12), analogous to a category's `code`:
 * lowercase, hyphen-separated, never renamed after other config starts referencing it.
 */
const KEY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CreateMenuDto {
  @Matches(KEY_PATTERN, { message: 'key must be lowercase, hyphen-separated' })
  @Length(1, 100)
  key!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
