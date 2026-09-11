import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

/**
 * `linkType` and its target (`pageId`/`contentId`/`externalUrl`) are deliberately not editable —
 * they define what the item fundamentally points at, the same way a category's `code` is immutable
 * after creation. Reordering, reparenting, and hide/show (doc 01 §12) are the only supported
 * patches; changing what an item links to means deleting and recreating it.
 */
export class UpdateMenuItemDto {
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
  isVisible?: boolean;
}
