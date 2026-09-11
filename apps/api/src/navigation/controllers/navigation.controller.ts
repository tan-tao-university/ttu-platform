import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RequirePermission } from '../../access/decorators/require-permission.decorator';
import { OptionalCurrentUser } from '../../access/decorators/optional-current-user.decorator';
import { OptionalJwtAuthGuard } from '../../access/guards/optional-jwt-auth.guard';
import { PermissionsGuard } from '../../access/guards/permissions.guard';
import type { AuthenticatedUser } from '../../access/access.types';
import { ApiError } from '../../common/http/api-error';
import { isForeignKeyViolation, isUniqueViolation } from '../../common/db/postgres-error.util';
import { paginationMeta } from '../../common/dto/pagination-query.dto';
import { assertValidLinkTarget } from '../menu-item-link.util';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { CreateMenuItemDto } from '../dto/create-menu-item.dto';
import { MenuListQueryDto } from '../dto/menu-list-query.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';
import { UpdateMenuItemDto } from '../dto/update-menu-item.dto';
import { UpsertMenuItemTranslationDto } from '../dto/upsert-menu-item-translation.dto';
import { MenusRepository } from '../repositories/menus.repository';

/**
 * One resource, one URL, addressed by the immutable `key` (`UpdateMenuDto` never lets it change) -
 * the same identifier the old `delivery/menus/:key` route used, now shared by both views (design
 * doc 06 §5). `GET /menus/:key` branches on `navigation.manage`: a manager gets the flat
 * item+translation list the drag-and-drop editor needs; anyone else gets the resolved,
 * locale-specific delivery tree, or a 404 if the menu is missing or inactive - inactive menus were
 * never visible through the old public route either.
 */
@Controller('menus')
@UseGuards(OptionalJwtAuthGuard, PermissionsGuard)
export class NavigationController {
  constructor(private readonly menus: MenusRepository) {}

  @Get()
  @RequirePermission('navigation.manage')
  async list(@Query() query: MenuListQueryDto) {
    const { items, total } = await this.menus.list(query);
    return { items, ...paginationMeta(query.page, query.pageSize, total) };
  }

  @Post()
  @RequirePermission('navigation.manage')
  async create(@Body() dto: CreateMenuDto) {
    try {
      return await this.menus.create(dto);
    } catch (error) {
      throw mapMenuWriteError(error, dto.key);
    }
  }

  @Get(':key')
  async get(
    @Param('key') key: string,
    @Query('locale') locale = 'vi',
    @OptionalCurrentUser() user?: AuthenticatedUser,
  ) {
    if (user?.permissions.has('navigation.manage')) {
      const menu = await this.menus.findByKey(key);
      if (!menu) throw menuNotFound(key);
      const items = await this.menus.listItemsWithTranslations(menu.id);
      return { ...menu, items };
    }

    const tree = await this.menus.resolveDeliveryTree(key, locale);
    if (!tree) throw menuNotFound(key);
    return { key, locale, items: tree };
  }

  @Patch(':key')
  @RequirePermission('navigation.manage')
  async update(@Param('key') key: string, @Body() dto: UpdateMenuDto) {
    const menu = await this.menus.findByKey(key);
    if (!menu) throw menuNotFound(key);
    const row = await this.menus.update(menu.id, dto);
    if (!row) throw menuNotFound(key);
    return row;
  }

  @Delete(':key')
  @RequirePermission('navigation.manage')
  @HttpCode(204)
  async remove(@Param('key') key: string): Promise<void> {
    const menu = await this.menus.findByKey(key);
    if (!menu) throw menuNotFound(key);
    await this.menus.remove(menu.id);
  }

  @Post(':key/items')
  @RequirePermission('navigation.manage')
  async createItem(@Param('key') key: string, @Body() dto: CreateMenuItemDto) {
    const menu = await this.menus.findByKey(key);
    if (!menu) throw menuNotFound(key);
    assertValidLinkTarget(dto);

    try {
      return await this.menus.createItem(menu.id, dto);
    } catch (error) {
      throw mapMenuItemWriteError(error);
    }
  }

  @Patch(':key/items/:itemId')
  @RequirePermission('navigation.manage')
  async updateItem(
    @Param('key') key: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateMenuItemDto,
  ) {
    const menu = await this.menus.findByKey(key);
    if (!menu) throw menuNotFound(key);
    const item = await this.menus.findItemById(itemId);
    if (!item || item.menuId !== menu.id) throw menuItemNotFound(itemId);

    try {
      const row = await this.menus.updateItem(itemId, dto);
      if (!row) throw menuItemNotFound(itemId);
      return row;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw mapMenuItemWriteError(error);
    }
  }

  @Delete(':key/items/:itemId')
  @RequirePermission('navigation.manage')
  @HttpCode(204)
  async removeItem(
    @Param('key') key: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ): Promise<void> {
    const menu = await this.menus.findByKey(key);
    if (!menu) throw menuNotFound(key);
    const item = await this.menus.findItemById(itemId);
    if (!item || item.menuId !== menu.id) throw menuItemNotFound(itemId);

    try {
      await this.menus.removeItem(itemId);
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new ApiError(
          409,
          'conflict',
          'Xung đột dữ liệu',
          `Menu item "${itemId}" still has child items`,
        );
      }
      throw error;
    }
  }

  @Put(':key/items/:itemId/translations/:locale')
  @RequirePermission('navigation.manage')
  async upsertItemTranslation(
    @Param('key') key: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Param('locale') locale: string,
    @Body() dto: UpsertMenuItemTranslationDto,
  ) {
    const menu = await this.menus.findByKey(key);
    if (!menu) throw menuNotFound(key);
    const item = await this.menus.findItemById(itemId);
    if (!item || item.menuId !== menu.id) throw menuItemNotFound(itemId);

    try {
      return await this.menus.upsertItemTranslation(itemId, locale, dto);
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new ApiError(
          422,
          'validation_error',
          'Dữ liệu không hợp lệ',
          `Unknown locale "${locale}"`,
          [{ field: 'locale', code: 'not_found', message: `Locale "${locale}" is not configured` }],
        );
      }
      throw error;
    }
  }
}

function menuNotFound(key: string): ApiError {
  return new ApiError(404, 'not_found', 'Không tìm thấy tài nguyên', `Menu "${key}" not found`);
}

function menuItemNotFound(id: string): ApiError {
  return new ApiError(404, 'not_found', 'Không tìm thấy tài nguyên', `Menu item "${id}" not found`);
}

function mapMenuWriteError(error: unknown, key: string): ApiError | never {
  if (error instanceof ApiError) throw error;
  if (isUniqueViolation(error)) {
    throw new ApiError(409, 'conflict', 'Xung đột dữ liệu', `key "${key}" is already in use`, [
      { field: 'key', code: 'duplicate', message: 'Menu key must be unique' },
    ]);
  }
  throw error;
}

function mapMenuItemWriteError(error: unknown): ApiError | never {
  if (isForeignKeyViolation(error)) {
    throw new ApiError(
      422,
      'validation_error',
      'Dữ liệu không hợp lệ',
      'parentId, pageId, or contentId does not exist',
      [{ field: 'parentId', code: 'not_found', message: 'Referenced row not found' }],
    );
  }
  throw error;
}
