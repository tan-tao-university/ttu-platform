import { IsBoolean, IsInt, IsObject, IsOptional, Min } from 'class-validator';

/**
 * `componentKey`/`componentVersion` are immutable after creation — same precedent as a menu item's
 * `linkType` (design doc 01/`menu-item-link.util.ts`): changing what a section fundamentally is
 * means deleting and recreating it, not a routine field update.
 */
export class UpdatePageSectionDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  style?: Record<string, unknown>;

  @IsInt()
  @Min(0)
  expectedLockVersion!: number;
}
