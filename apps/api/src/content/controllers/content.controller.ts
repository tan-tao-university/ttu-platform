import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RequirePermission } from '../../access/decorators/require-permission.decorator';
import { CurrentUser } from '../../access/decorators/current-user.decorator';
import { OptionalCurrentUser } from '../../access/decorators/optional-current-user.decorator';
import { OptionalJwtAuthGuard } from '../../access/guards/optional-jwt-auth.guard';
import { PermissionsGuard } from '../../access/guards/permissions.guard';
import type { AuthenticatedUser } from '../../access/access.types';
import { ApiError } from '../../common/http/api-error';
import { isForeignKeyViolation } from '../../common/db/postgres-error.util';
import { paginationMeta } from '../../common/dto/pagination-query.dto';
import { AssignCategoryDto } from '../dto/assign-category.dto';
import { AssignTagDto } from '../dto/assign-tag.dto';
import { ContentListQueryDto } from '../dto/content-list-query.dto';
import { CreateContentItemDto } from '../dto/create-content-item.dto';
import { PublishContentDto } from '../dto/publish-content.dto';
import { UpdateContentItemDto } from '../dto/update-content-item.dto';
import { UpsertContentTranslationDto } from '../dto/upsert-content-translation.dto';
import { UpsertEventDto } from '../dto/upsert-event.dto';
import { ContentAssignmentsRepository } from '../repositories/content-assignments.repository';
import {
  ContentItemsRepository,
  type ContentItemWithRevision,
} from '../repositories/content-items.repository';
import { ContentPublishingService } from '../services/content-publishing.service';

/**
 * One resource, one URL — `content.read` decides depth of access rather than a separate
 * `/admin/content` + `/public/content` namespace (design doc 06 §5). Read routes (`list`, `get`,
 * `getBySlug`) branch in application code on the caller's permission set; every write route keeps
 * requiring the specific permission it always has via `@RequirePermission(...)`, enforced the same
 * as before by `PermissionsGuard` — the only thing that changed is `OptionalJwtAuthGuard` no longer
 * 401s an anonymous caller before the handler gets a chance to serve the public view.
 */
@Controller('content')
@UseGuards(OptionalJwtAuthGuard, PermissionsGuard)
export class ContentController {
  constructor(
    private readonly contentItems: ContentItemsRepository,
    private readonly assignments: ContentAssignmentsRepository,
    private readonly publishing: ContentPublishingService,
  ) {}

  @Get()
  async list(@Query() query: ContentListQueryDto, @OptionalCurrentUser() user?: AuthenticatedUser) {
    if (user?.permissions.has('content.read')) {
      const { items, total } = await this.contentItems.listForAdmin(query);
      return { items, ...paginationMeta(query.page, query.pageSize, total) };
    }

    const { items, total } = await this.contentItems.listPublished(query);
    return {
      items: items.map((item) => toPublicResource(item)),
      ...paginationMeta(query.page, query.pageSize, total),
    };
  }

  /**
   * Always resolves the currently _published_ item for that locale, regardless of caller privilege
   * — draft slugs are not unique (doc 05 §8.2), so there is no well-defined "admin" answer to "find
   * the draft matching this slug". Declared ahead of `:id` so `by-slug` is never captured by it.
   */
  @Get('by-slug/:locale/:slug')
  async getBySlug(@Param('locale') locale: string, @Param('slug') slug: string) {
    const result = await this.contentItems.findPublishedBySlug(locale, slug);
    if (!result) throw new NotFoundException(`Content "${slug}" not found`);
    return this.enrichedPublicResource(result, locale);
  }

  @Get(':id')
  async get(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('locale') locale: string | undefined,
    @OptionalCurrentUser() user?: AuthenticatedUser,
  ) {
    if (user?.permissions.has('content.read')) {
      const item = await this.contentItems.findById(id);
      if (!item) throw notFound(id);

      const [translations, event, categories, tags] = await Promise.all([
        this.contentItems.listTranslations(id),
        this.contentItems.findEvent(id),
        this.assignments.listCategories(id, locale ?? 'vi'),
        this.assignments.listTags(id, locale ?? 'vi'),
      ]);

      return { ...item, translations, event: event ?? null, categories, tags };
    }

    if (!locale) {
      throw new ApiError(422, 'validation_error', 'Dữ liệu không hợp lệ', 'locale is required', [
        { field: 'locale', code: 'required', message: 'locale query parameter is required' },
      ]);
    }
    const result = await this.contentItems.findPublishedById(id, locale);
    if (!result) throw notFound(id);
    return this.enrichedPublicResource(result, locale);
  }

  @Post()
  @RequirePermission('content.create')
  async create(@Body() dto: CreateContentItemDto, @CurrentUser() user: AuthenticatedUser) {
    return this.contentItems.create(dto, user.id);
  }

  @Patch(':id')
  @RequirePermission('content.edit')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContentItemDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    try {
      const row = await this.contentItems.update(id, dto, user.id);
      if (!row) throw notFound(id);
      return row;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (isForeignKeyViolation(error)) {
        throw new ApiError(
          422,
          'validation_error',
          'Dữ liệu không hợp lệ',
          'featuredMediaId does not exist',
          [{ field: 'featuredMediaId', code: 'not_found', message: 'Media asset not found' }],
        );
      }
      throw error;
    }
  }

  @Delete(':id')
  @RequirePermission('content.delete')
  @HttpCode(204)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    const row = await this.contentItems.softDelete(id, user.id);
    if (!row) throw notFound(id);
  }

  @Post(':id/translations/:locale')
  @RequirePermission('content.edit')
  async upsertTranslation(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('locale') locale: string,
    @Body() dto: UpsertContentTranslationDto,
  ) {
    const item = await this.contentItems.findById(id);
    if (!item) throw notFound(id);

    try {
      return await this.contentItems.upsertTranslation(id, locale, dto);
    } catch (error) {
      throw mapTranslationWriteError(error, locale);
    }
  }

  @Post(':id/event')
  @RequirePermission('content.edit')
  async upsertEvent(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpsertEventDto) {
    const item = await this.contentItems.findById(id);
    if (!item) throw notFound(id);
    if (item.type !== 'EVENT') {
      throw new ApiError(
        422,
        'validation_error',
        'Dữ liệu không hợp lệ',
        `Content item "${id}" is not type EVENT`,
        [
          {
            field: 'type',
            code: 'invalid',
            message: 'Only EVENT content items can have event details',
          },
        ],
      );
    }
    return this.contentItems.upsertEvent(id, dto);
  }

  @Post(':id/locales/:locale/publish')
  @RequirePermission('content.publish')
  async publish(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('locale') locale: string,
    @Body() dto: PublishContentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.publishing.publish(id, locale, user.id, dto);
  }

  @Get(':id/locales/:locale/revisions')
  @RequirePermission('content.read')
  async listRevisions(@Param('id', ParseUUIDPipe) id: string, @Param('locale') locale: string) {
    return this.publishing.listRevisions(id, locale);
  }

  @Post(':id/locales/:locale/restore/:revisionId')
  @RequirePermission('content.restore')
  async restore(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('locale') locale: string,
    @Param('revisionId', ParseUUIDPipe) revisionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.publishing.restore(id, locale, revisionId, user.id);
  }

  @Post(':id/categories')
  @RequirePermission('content.edit')
  async assignCategory(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AssignCategoryDto) {
    const item = await this.contentItems.findById(id);
    if (!item) throw notFound(id);
    try {
      await this.assignments.assignCategory(id, dto.categoryId, dto.isPrimary ?? false);
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new ApiError(
          422,
          'validation_error',
          'Dữ liệu không hợp lệ',
          'categoryId does not exist',
          [{ field: 'categoryId', code: 'not_found', message: 'Category not found' }],
        );
      }
      throw error;
    }
  }

  @Delete(':id/categories/:categoryId')
  @RequirePermission('content.edit')
  @HttpCode(204)
  async unassignCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
  ): Promise<void> {
    await this.assignments.unassignCategory(id, categoryId);
  }

  @Post(':id/tags')
  @RequirePermission('content.edit')
  async assignTag(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AssignTagDto) {
    const item = await this.contentItems.findById(id);
    if (!item) throw notFound(id);
    try {
      await this.assignments.assignTag(id, dto.tagId);
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new ApiError(
          422,
          'validation_error',
          'Dữ liệu không hợp lệ',
          'tagId does not exist',
          [{ field: 'tagId', code: 'not_found', message: 'Tag not found' }],
        );
      }
      throw error;
    }
  }

  @Delete(':id/tags/:tagId')
  @RequirePermission('content.edit')
  @HttpCode(204)
  async unassignTag(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('tagId', ParseUUIDPipe) tagId: string,
  ): Promise<void> {
    await this.assignments.unassignTag(id, tagId);
  }

  private async enrichedPublicResource(result: ContentItemWithRevision, locale: string) {
    const [event, categories, tags] = await Promise.all([
      result.type === 'EVENT' ? this.contentItems.findEvent(result.id) : Promise.resolve(undefined),
      this.assignments.listCategories(result.id, locale),
      this.assignments.listTags(result.id, locale),
    ]);
    return { ...toPublicResource(result), event: event ?? null, categories, tags };
  }
}

function toPublicResource(item: ContentItemWithRevision) {
  const translation = item.snapshot.translation;

  // API never returns database internals (created_by, updated_at, deleted_at, ...) to an
  // unprivileged caller — only the contract fields a visitor's page actually needs (doc 06 §7.1).
  return {
    id: item.id,
    type: item.type,
    slug: translation.slug,
    title: translation.title,
    excerpt: translation.excerpt,
    body: translation.body,
    bodyFormat: translation.bodyFormat,
    seo: {
      title: translation.seoTitle,
      description: translation.seoDescription,
      ogTitle: translation.ogTitle,
      ogDescription: translation.ogDescription,
      canonicalUrl: translation.canonicalUrl,
      robotsIndex: translation.robotsIndex,
      robotsFollow: translation.robotsFollow,
    },
    publishedAt: item.publishedAt,
  };
}

function notFound(id: string): ApiError {
  return new ApiError(
    404,
    'not_found',
    'Không tìm thấy tài nguyên',
    `Content item "${id}" not found`,
  );
}

/**
 * Unlike `category_translations`/`tag_translations`, `content_translations` has no unique
 * constraint on `(locale, slug)` (design doc 05 §8.2) — draft slugs can collide freely. Uniqueness
 * is enforced once, at publish time, against `public_routes(locale, path)` (doc 05 §17) — see
 * `ContentPublishingService`'s 409 there.
 */
function mapTranslationWriteError(error: unknown, locale: string): ApiError | never {
  if (isForeignKeyViolation(error)) {
    return new ApiError(
      422,
      'validation_error',
      'Dữ liệu không hợp lệ',
      `Unknown locale "${locale}"`,
      [{ field: 'locale', code: 'not_found', message: `Locale "${locale}" is not configured` }],
    );
  }
  throw error;
}
