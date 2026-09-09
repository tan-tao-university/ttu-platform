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
import { CategoryListQueryDto } from '../dto/category-list-query.dto';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { UpsertCategoryTranslationDto } from '../dto/upsert-category-translation.dto';
import { CategoriesRepository } from '../repositories/categories.repository';

// No dedicated `taxonomy.*` permission code exists in the catalog (design doc 07 §11) —
// categories/tags support content categorization (doc 01 §6 groups "Quản lý category/tag"
// under the CMS Admin persona without a separate permission), so this reuses `content.read`
// and `content.edit` rather than inventing an ungrounded code.
@Controller('admin/categories')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AdminCategoriesController {
  constructor(private readonly categories: CategoriesRepository) {}

  @Get()
  @RequirePermission('content.read')
  async list(@Query() query: CategoryListQueryDto) {
    const { items, total } = await this.categories.list(query);
    return { items, ...paginationMeta(query.page, query.pageSize, total) };
  }

  @Get(':id')
  @RequirePermission('content.read')
  async get(@Param('id', ParseUUIDPipe) id: string) {
    const category = await this.categories.findById(id);
    if (!category) throw notFound(id);
    return category;
  }

  @Post()
  @RequirePermission('content.edit')
  async create(@Body() dto: CreateCategoryDto) {
    try {
      return await this.categories.create(dto);
    } catch (error) {
      throw mapWriteError(error, dto.code);
    }
  }

  @Patch(':id')
  @RequirePermission('content.edit')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCategoryDto) {
    try {
      const row = await this.categories.update(id, dto);
      if (!row) throw notFound(id);
      return row;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw mapWriteError(error);
    }
  }

  @Delete(':id')
  @RequirePermission('content.edit')
  @HttpCode(204)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    try {
      const row = await this.categories.remove(id);
      if (!row) throw notFound(id);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (isForeignKeyViolation(error)) {
        throw new ApiError(
          409,
          'conflict',
          'Xung đột dữ liệu',
          'Category still has child categories or content assigned to it',
        );
      }
      throw error;
    }
  }

  @Put(':id/translations/:locale')
  @RequirePermission('content.edit')
  async upsertTranslation(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('locale') locale: string,
    @Body() dto: UpsertCategoryTranslationDto,
  ) {
    const category = await this.categories.findById(id);
    if (!category) throw notFound(id);

    try {
      return await this.categories.upsertTranslation(id, locale, dto);
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
      if (isUniqueViolation(error)) {
        throw new ApiError(
          409,
          'conflict',
          'Xung đột dữ liệu',
          `slug "${dto.slug}" is already used by another category in locale "${locale}"`,
          [{ field: 'slug', code: 'duplicate', message: 'Slug must be unique per locale' }],
        );
      }
      throw error;
    }
  }
}

function notFound(id: string): ApiError {
  return new ApiError(404, 'not_found', 'Không tìm thấy tài nguyên', `Category "${id}" not found`);
}

function mapWriteError(error: unknown, code?: string): ApiError | never {
  if (isUniqueViolation(error)) {
    return new ApiError(
      409,
      'conflict',
      'Xung đột dữ liệu',
      code ? `code "${code}" is already in use` : 'code is already in use',
      [{ field: 'code', code: 'duplicate', message: 'Category code must be unique' }],
    );
  }
  if (isForeignKeyViolation(error)) {
    return new ApiError(
      422,
      'validation_error',
      'Dữ liệu không hợp lệ',
      'parentId does not reference an existing category',
      [{ field: 'parentId', code: 'not_found', message: 'Parent category not found' }],
    );
  }
  throw error;
}
