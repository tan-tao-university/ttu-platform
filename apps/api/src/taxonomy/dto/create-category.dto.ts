import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsUUID, Matches, Min } from 'class-validator';

/**
 * `code` is the stable, machine-readable identifier categories are addressed by outside the admin
 * UI (component config `categoryId` references, doc 02 §15) — lowercase, hyphen/underscore, no
 * spaces, so it never needs to change when the display name does.
 */
const CODE_PATTERN = /^[a-z0-9][a-z0-9_-]{0,99}$/;

export class CreateCategoryDto {
  @Matches(CODE_PATTERN, {
    message: 'code must be lowercase alphanumeric with - or _, max 100 chars',
  })
  code!: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
