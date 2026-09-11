import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsUrl, IsUUID, Min } from 'class-validator';
import { MENU_ITEM_LINK_TYPES, type MenuItemLinkType } from '../../db/schema';

/**
 * `linkType` decides exactly which one of `pageId`/`contentId`/`externalUrl` must be set — a
 * discriminated union the DB's `menu_items_link_type_check` constraint also enforces. Validated
 * imperatively in the controller (`assertValidLinkTarget`) rather than with per-field
 * `@ValidateIf`, which cannot express "and every other target field must be absent" precisely.
 */
export class CreateMenuItemDto {
  @IsIn(MENU_ITEM_LINK_TYPES)
  linkType!: MenuItemLinkType;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsUUID()
  pageId?: string;

  @IsOptional()
  @IsUUID()
  contentId?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  externalUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}
