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
import { JwtAuthGuard } from '../../access/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../access/guards/permissions.guard';
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

@Controller('admin/menus')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermission('navigation.manage')
export class AdminNavigationController {
  constructor(private readonly menus: MenusRepository) {}

  @Get()
  async list(@Query() query: MenuListQueryDto) {
    const { items, total } = await this.menus.list(query);
    return { items, ...paginationMeta(query.page, query.pageSize, total) };
  }

  @Post()
  async create(@Body() dto: CreateMenuDto) {
    try {
      return await this.menus.create(dto);
    } catch (error) {
      throw mapMenuWriteError(error, dto.key);
    }
  }

  @Get(':id')
  async get(@Param('id', ParseUUIDPipe) id: string) {
    const menu = await this.menus.findById(id);
    if (!menu) throw menuNotFound(id);
    const items = await this.menus.listItemsWithTranslations(id);
    return { ...menu, items };
  }

  @Patch(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateMenuDto) {
    const row = await this.menus.update(id, dto);
    if (!row) throw menuNotFound(id);
    return row;
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    const row = await this.menus.remove(id);
    if (!row) throw menuNotFound(id);
  }

  @Post(':id/items')
  async createItem(@Param('id', ParseUUIDPipe) menuId: string, @Body() dto: CreateMenuItemDto) {
    const menu = await this.menus.findById(menuId);
    if (!menu) throw menuNotFound(menuId);
    assertValidLinkTarget(dto);

    try {
      return await this.menus.createItem(menuId, dto);
    } catch (error) {
      throw mapMenuItemWriteError(error);
    }
  }

  @Patch(':id/items/:itemId')
  async updateItem(
    @Param('id', ParseUUIDPipe) menuId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateMenuItemDto,
  ) {
    const item = await this.menus.findItemById(itemId);
    if (!item || item.menuId !== menuId) throw menuItemNotFound(itemId);

    try {
      const row = await this.menus.updateItem(itemId, dto);
      if (!row) throw menuItemNotFound(itemId);
      return row;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw mapMenuItemWriteError(error);
    }
  }

  @Delete(':id/items/:itemId')
  @HttpCode(204)
  async removeItem(
    @Param('id', ParseUUIDPipe) menuId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ): Promise<void> {
    const item = await this.menus.findItemById(itemId);
    if (!item || item.menuId !== menuId) throw menuItemNotFound(itemId);

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

  @Put(':id/items/:itemId/translations/:locale')
  async upsertItemTranslation(
    @Param('id', ParseUUIDPipe) menuId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Param('locale') locale: string,
    @Body() dto: UpsertMenuItemTranslationDto,
  ) {
    const item = await this.menus.findItemById(itemId);
    if (!item || item.menuId !== menuId) throw menuItemNotFound(itemId);

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

function menuNotFound(id: string): ApiError {
  return new ApiError(404, 'not_found', 'Không tìm thấy tài nguyên', `Menu "${id}" not found`);
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
