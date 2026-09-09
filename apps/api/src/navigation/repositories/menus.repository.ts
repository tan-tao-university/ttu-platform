import { Injectable } from '@nestjs/common';
import { and, eq, inArray, or, sql } from 'drizzle-orm';
import { db } from '../../db';
import {
  type Menu,
  type MenuItem,
  type MenuItemLinkType,
  menus,
  menuItems,
  menuItemTranslations,
  publicRoutes,
} from '../../db/schema';
import { resolveMenuItemHref } from '../menu-item-link.util';
import type { MenuListQueryDto } from '../dto/menu-list-query.dto';
import type { CreateMenuDto } from '../dto/create-menu.dto';
import type { UpdateMenuDto } from '../dto/update-menu.dto';
import type { CreateMenuItemDto } from '../dto/create-menu-item.dto';
import type { UpdateMenuItemDto } from '../dto/update-menu-item.dto';
import type { UpsertMenuItemTranslationDto } from '../dto/upsert-menu-item-translation.dto';

export interface MenuItemTranslationRow {
  locale: string;
  label: string;
  customPath: string | null;
}

export type MenuItemWithTranslations = MenuItem & { translations: MenuItemTranslationRow[] };

/**
 * Doc 01 §12's render-ready shape: unlike the admin flat list, a public consumer needs a nested
 * tree with the item's actual href already resolved.
 */
export interface PublicMenuItemNode {
  id: string;
  linkType: MenuItemLinkType;
  label: string;
  href: string | null;
  children: PublicMenuItemNode[];
}

@Injectable()
export class MenusRepository {
  async list(query: MenuListQueryDto): Promise<{ items: Menu[]; total: number }> {
    const conditions = [
      query.isActive !== undefined ? eq(menus.isActive, query.isActive) : undefined,
    ].filter((c) => c !== undefined);
    const where = conditions.length ? and(...conditions) : undefined;

    const [items, [{ count }]] = await Promise.all([
      db
        .select()
        .from(menus)
        .where(where)
        .orderBy(menus.key)
        .limit(query.pageSize)
        .offset((query.page - 1) * query.pageSize),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(menus)
        .where(where),
    ]);

    return { items, total: count };
  }

  async findById(id: string): Promise<Menu | undefined> {
    const [row] = await db.select().from(menus).where(eq(menus.id, id));
    return row;
  }

  async findByKey(key: string): Promise<Menu | undefined> {
    const [row] = await db.select().from(menus).where(eq(menus.key, key));
    return row;
  }

  /**
   * Flat, ordered by `sortOrder` — the same shape `CategoriesRepository.list` uses (parentId per
   * row, not a server-built tree). The admin drag-and-drop tree editor assembles it client-side;
   * the public resolver (`public-navigation.controller.ts`) builds a render tree separately because
   * that consumer genuinely needs one.
   */
  async listItemsWithTranslations(menuId: string): Promise<MenuItemWithTranslations[]> {
    const items = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.menuId, menuId))
      .orderBy(menuItems.sortOrder);
    if (items.length === 0) return [];

    const translations = await db
      .select({
        menuItemId: menuItemTranslations.menuItemId,
        locale: menuItemTranslations.locale,
        label: menuItemTranslations.label,
        customPath: menuItemTranslations.customPath,
      })
      .from(menuItemTranslations)
      .where(
        inArray(
          menuItemTranslations.menuItemId,
          items.map((item) => item.id),
        ),
      );

    const translationsByItemId = new Map<string, MenuItemTranslationRow[]>();
    for (const { menuItemId, ...translation } of translations) {
      const list = translationsByItemId.get(menuItemId) ?? [];
      list.push(translation);
      translationsByItemId.set(menuItemId, list);
    }

    return items.map((item) => ({
      ...item,
      translations: translationsByItemId.get(item.id) ?? [],
    }));
  }

  async create(dto: CreateMenuDto): Promise<Menu> {
    const [row] = await db
      .insert(menus)
      .values({ key: dto.key, isActive: dto.isActive })
      .returning();
    return row;
  }

  async update(id: string, dto: UpdateMenuDto): Promise<Menu | undefined> {
    const [row] = await db
      .update(menus)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(menus.id, id))
      .returning();
    return row;
  }

  async remove(id: string): Promise<Menu | undefined> {
    const [row] = await db.delete(menus).where(eq(menus.id, id)).returning();
    return row;
  }

  async findItemById(id: string): Promise<MenuItem | undefined> {
    const [row] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return row;
  }

  async createItem(menuId: string, dto: CreateMenuItemDto): Promise<MenuItem> {
    const [row] = await db
      .insert(menuItems)
      .values({
        menuId,
        parentId: dto.parentId,
        linkType: dto.linkType,
        pageId: dto.pageId,
        contentId: dto.contentId,
        externalUrl: dto.externalUrl,
        sortOrder: dto.sortOrder,
        isVisible: dto.isVisible,
      })
      .returning();
    return row;
  }

  async updateItem(id: string, dto: UpdateMenuItemDto): Promise<MenuItem | undefined> {
    const [row] = await db
      .update(menuItems)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(menuItems.id, id))
      .returning();
    return row;
  }

  async removeItem(id: string): Promise<MenuItem | undefined> {
    const [row] = await db.delete(menuItems).where(eq(menuItems.id, id)).returning();
    return row;
  }

  async upsertItemTranslation(
    menuItemId: string,
    locale: string,
    dto: UpsertMenuItemTranslationDto,
  ): Promise<MenuItemTranslationRow> {
    const values = { menuItemId, locale, label: dto.label, customPath: dto.customPath ?? null };
    const [row] = await db
      .insert(menuItemTranslations)
      .values(values)
      .onConflictDoUpdate({
        target: [menuItemTranslations.menuItemId, menuItemTranslations.locale],
        set: { label: dto.label, customPath: dto.customPath ?? null },
      })
      .returning({
        menuItemId: menuItemTranslations.menuItemId,
        locale: menuItemTranslations.locale,
        label: menuItemTranslations.label,
        customPath: menuItemTranslations.customPath,
      });
    const { menuItemId: _menuItemId, ...translation } = row;
    return translation;
  }

  /**
   * Doc 01 §12: render-ready tree for `key`/`locale`, visible items only, each item's href already
   * resolved. `PAGE` items resolve via `public_routes.pageId` — always `null` today since the CMS
   * Page Builder domain (doc 02-03) is blocked and never publishes a page, but the join is correct
   * and forward-compatible once it does. `undefined` means the menu does not exist or is inactive.
   */
  async resolvePublicTree(key: string, locale: string): Promise<PublicMenuItemNode[] | undefined> {
    const menu = await this.findByKey(key);
    if (!menu || !menu.isActive) return undefined;

    const rows = await db
      .select({
        item: menuItems,
        translation: menuItemTranslations,
        resolvedPath: publicRoutes.path,
      })
      .from(menuItems)
      .innerJoin(
        menuItemTranslations,
        and(
          eq(menuItemTranslations.menuItemId, menuItems.id),
          eq(menuItemTranslations.locale, locale),
        ),
      )
      .leftJoin(
        publicRoutes,
        and(
          eq(publicRoutes.locale, locale),
          or(
            and(eq(menuItems.linkType, 'CONTENT'), eq(publicRoutes.contentId, menuItems.contentId)),
            and(eq(menuItems.linkType, 'PAGE'), eq(publicRoutes.pageId, menuItems.pageId)),
          ),
        ),
      )
      .where(and(eq(menuItems.menuId, menu.id), eq(menuItems.isVisible, true)))
      .orderBy(menuItems.sortOrder);

    const nodesById = new Map<string, PublicMenuItemNode>();
    for (const row of rows) {
      nodesById.set(row.item.id, {
        id: row.item.id,
        linkType: row.item.linkType,
        label: row.translation.label,
        href: resolveMenuItemHref(row.item, row.translation, row.resolvedPath),
        children: [],
      });
    }

    const roots: PublicMenuItemNode[] = [];
    for (const row of rows) {
      const node = nodesById.get(row.item.id);
      if (!node) continue;
      const parent = row.item.parentId ? nodesById.get(row.item.parentId) : undefined;
      (parent ? parent.children : roots).push(node);
    }
    return roots;
  }
}
