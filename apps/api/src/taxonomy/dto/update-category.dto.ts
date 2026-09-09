import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

/**
 * Every field optional — a partial patch. `code` is deliberately not editable here: it is the
 * stable identifier other config (component `categoryId` references) is written against, so
 * renaming it is a decision that needs its own reviewed migration path, not a routine field
 * update.
 */
export class UpdateCategoryDto {
  @IsOptional()
  @IsUUID()
  parentId?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
