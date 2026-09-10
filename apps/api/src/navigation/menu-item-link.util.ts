import { ApiError } from '../common/http/api-error';
import type { MenuItem, MenuItemLinkType } from '../db/schema';

/**
 * Which single target field a given `linkType` requires — the same discriminated union the DB's
 * `menu_items_link_type_check` constraint enforces (`schema.ts`).
 */
const TARGET_FIELD_BY_LINK_TYPE: Record<
  MenuItemLinkType,
  'pageId' | 'contentId' | 'externalUrl' | null
> = {
  PAGE: 'pageId',
  CONTENT: 'contentId',
  EXTERNAL: 'externalUrl',
  CUSTOM_PATH: null,
  GROUP: null,
};

export interface MenuItemLinkFields {
  linkType: MenuItemLinkType;
  pageId?: string | null;
  contentId?: string | null;
  externalUrl?: string | null;
}

/**
 * Enforces the discriminated union ahead of the insert, so a bad request gets a field-level 422
 * instead of a raw DB constraint violation: exactly the target field `linkType` names must be set,
 * and every other target field must be absent.
 */
export function assertValidLinkTarget(dto: MenuItemLinkFields): void {
  const targetByField = {
    pageId: dto.pageId,
    contentId: dto.contentId,
    externalUrl: dto.externalUrl,
  };
  const requiredField = TARGET_FIELD_BY_LINK_TYPE[dto.linkType];

  if (requiredField && !targetByField[requiredField]) {
    throw new ApiError(
      422,
      'validation_error',
      'Dữ liệu không hợp lệ',
      `linkType "${dto.linkType}" requires "${requiredField}"`,
      [
        {
          field: requiredField,
          code: 'required',
          message: `Required when linkType is ${dto.linkType}`,
        },
      ],
    );
  }

  for (const [field, value] of Object.entries(targetByField) as [
    'pageId' | 'contentId' | 'externalUrl',
    string | null | undefined,
  ][]) {
    if (field === requiredField || !value) continue;
    throw new ApiError(
      422,
      'validation_error',
      'Dữ liệu không hợp lệ',
      `"${field}" must not be set when linkType is "${dto.linkType}"`,
      [{ field, code: 'not_allowed', message: `Not valid for linkType ${dto.linkType}` }],
    );
  }
}

export interface MenuItemLabelFields {
  customPath: string | null;
}

/**
 * Doc 01 §12: the delivery tree carries a pre-resolved `href`, never a target ID the frontend would
 * have to look up itself. `PAGE`/`CONTENT` resolve through `public_routes` (see
 * `MenusRepository.resolveDeliveryTree`'s join) — `resolvedPath` is `null` when nothing has
 * published that target yet, which is always true for `PAGE` today (CMS Page Builder is blocked).
 */
export function resolveMenuItemHref(
  item: Pick<MenuItem, 'linkType' | 'externalUrl'>,
  translation: MenuItemLabelFields,
  resolvedPath: string | null,
): string | null {
  switch (item.linkType) {
    case 'EXTERNAL':
      return item.externalUrl;
    case 'CUSTOM_PATH':
      return translation.customPath;
    case 'CONTENT':
    case 'PAGE':
      return resolvedPath;
    case 'GROUP':
      return null;
  }
}
