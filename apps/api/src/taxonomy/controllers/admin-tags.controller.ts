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
import { isForeignKeyViolation, isUniqueViolation } from '../../common/db/postgres-error.util';
import { ApiError } from '../../common/http/api-error';
import { paginationMeta } from '../../common/dto/pagination-query.dto';
import { CreateTagDto } from '../dto/create-tag.dto';
import { TagListQueryDto } from '../dto/tag-list-query.dto';
import { UpdateTagDto } from '../dto/update-tag.dto';
import { UpsertTagTranslationDto } from '../dto/upsert-tag-translation.dto';
import { TagsRepository } from '../repositories/tags.repository';

/**
 * Tags controller for CMS administration.
 *
 * Reuses `content.read` and `content.edit` permissions for tag management.
 */
@Controller('admin/tags')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AdminTagsController {
  constructor(private readonly tags: TagsRepository) {}

  @Get()
  @RequirePermission('content.read')
  async list(@Query() query: TagListQueryDto) {
    const { items, total } = await this.tags.list(query);
    return { items, ...paginationMeta(query.page, query.pageSize, total) };
  }

  @Get(':id')
  @RequirePermission('content.read')
  async get(@Param('id', ParseUUIDPipe) id: string) {
    const tag = await this.tags.findById(id);
    if (!tag) throw notFound(id);
    return tag;
  }

  @Post()
  @RequirePermission('content.edit')
  async create(@Body() dto: CreateTagDto) {
    try {
      return await this.tags.create(dto);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ApiError(409, 'conflict', 'Xung đột dữ liệu', 'code is already in use', [
          { field: 'code', code: 'duplicate', message: 'Tag code must be unique' },
        ]);
      }
      throw error;
    }
  }

  @Patch(':id')
  @RequirePermission('content.edit')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTagDto) {
    const row = await this.tags.update(id, dto);
    if (!row) throw notFound(id);
    return row;
  }

  @Delete(':id')
  @RequirePermission('content.edit')
  @HttpCode(204)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    try {
      const row = await this.tags.remove(id);
      if (!row) throw notFound(id);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (isForeignKeyViolation(error)) {
        throw new ApiError(
          409,
          'conflict',
          'Xung đột dữ liệu',
          'Tag still has content assigned to it',
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
    @Body() dto: UpsertTagTranslationDto,
  ) {
    const tag = await this.tags.findById(id);
    if (!tag) throw notFound(id);

    try {
      return await this.tags.upsertTranslation(id, locale, dto);
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
          `slug "${dto.slug}" is already used by another tag in locale "${locale}"`,
          [{ field: 'slug', code: 'duplicate', message: 'Slug must be unique per locale' }],
        );
      }
      throw error;
    }
  }
}

function notFound(id: string): ApiError {
  return new ApiError(404, 'not_found', 'Không tìm thấy tài nguyên', `Tag "${id}" not found`);
}
