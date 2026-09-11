import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CurrentUser } from '../../access/decorators/current-user.decorator';
import { RequirePermission } from '../../access/decorators/require-permission.decorator';
import { JwtAuthGuard } from '../../access/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../access/guards/permissions.guard';
import type { AuthenticatedUser } from '../../access/access.types';
import { ApiError } from '../../common/http/api-error';
import { paginationMeta } from '../../common/dto/pagination-query.dto';
import type { MediaAsset } from '../../db/schema';
import { AdminMediaListQueryDto } from '../dto/admin-media-list-query.dto';
import { UpsertMediaTranslationDto } from '../dto/upsert-media-translation.dto';
import { MAX_UPLOAD_BYTES } from '../media-type-policy';
import { MediaAssetsRepository } from '../repositories/media-assets.repository';
import { MediaUploadService } from '../services/media-upload.service';
import { StorageService } from '../services/storage.service';

@Controller('media')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MediaController {
  constructor(
    private readonly mediaAssets: MediaAssetsRepository,
    private readonly upload: MediaUploadService,
    private readonly storage: StorageService,
  ) {}

  @Get()
  @RequirePermission('media.read')
  async list(@Query() query: AdminMediaListQueryDto) {
    const { items, total } = await this.mediaAssets.listForAdmin(query);
    const resolved = items.map((item) => this.withDeliveryUrl(item));
    return { items: resolved, ...paginationMeta(query.page, query.pageSize, total) };
  }

  @Get(':id')
  @RequirePermission('media.read')
  async get(@Param('id', ParseUUIDPipe) id: string) {
    const item = await this.mediaAssets.findById(id);
    if (!item) throw notFound(id);
    const translations = await this.mediaAssets.listTranslations(id);
    return { ...this.withDeliveryUrl(item), translations };
  }

  @Post()
  @RequirePermission('media.upload')
  @UseInterceptors(
    FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: MAX_UPLOAD_BYTES } }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!file) {
      throw new ApiError(422, 'validation_error', 'Dữ liệu không hợp lệ', 'No file was uploaded', [
        { field: 'file', code: 'required', message: 'file is required' },
      ]);
    }
    const row = await this.upload.upload(file, user.id);
    return this.withDeliveryUrl(row);
  }

  @Put(':id/translations/:locale')
  @RequirePermission('media.update')
  async upsertTranslation(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('locale') locale: string,
    @Body() dto: UpsertMediaTranslationDto,
  ) {
    const item = await this.mediaAssets.findById(id);
    if (!item) throw notFound(id);
    return this.mediaAssets.upsertTranslation(id, locale, dto);
  }

  @Delete(':id')
  @RequirePermission('media.delete')
  @HttpCode(204)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    const item = await this.mediaAssets.findById(id);
    if (!item) throw notFound(id);

    if (await this.mediaAssets.isReferenced(id)) {
      throw new ApiError(
        409,
        'conflict',
        'Không thể xóa',
        `Media asset "${id}" is still referenced by published content or an active profile`,
      );
    }

    await this.mediaAssets.softDelete(id);
  }

  /**
   * Doc 08 §24's permission list has no dedicated "restore" code — undoing a delete falls under
   * `media.delete`, the same permission that authorizes the delete this reverses.
   */
  @Post(':id/restore')
  @RequirePermission('media.delete')
  async restore(@Param('id', ParseUUIDPipe) id: string) {
    const row = await this.mediaAssets.restore(id);
    if (!row) throw notFound(id);
    return this.withDeliveryUrl(row);
  }

  private withDeliveryUrl(item: MediaAsset) {
    return { ...item, url: this.storage.getDeliveryUrl(item.storageKey) };
  }
}

function notFound(id: string): ApiError {
  return new ApiError(
    404,
    'not_found',
    'Không tìm thấy tài nguyên',
    `Media asset "${id}" not found`,
  );
}
