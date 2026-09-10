import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe,
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
import { paginationMeta } from '../../common/dto/pagination-query.dto';
import { CreatePageDto } from '../dto/create-page.dto';
import { CreatePageSectionDto } from '../dto/create-page-section.dto';
import { PageListQueryDto } from '../dto/page-list-query.dto';
import { PublishPageDto } from '../dto/publish-page.dto';
import { ReorderPageSectionsDto } from '../dto/reorder-page-sections.dto';
import { UpdatePageSectionDto } from '../dto/update-page-section.dto';
import { UpsertPageSectionTranslationDto } from '../dto/upsert-page-section-translation.dto';
import { UpsertPageTranslationDto } from '../dto/upsert-page-translation.dto';
import { PageSectionsRepository } from '../repositories/page-sections.repository';
import { type PageWithRevision, PagesRepository } from '../repositories/pages.repository';
import { PagePublishingService } from '../services/page-publishing.service';
import { PageSectionsService } from '../services/page-sections.service';

/**
 * One resource, one URL — `page.read` decides depth of access rather than a separate `/admin/pages`
 * + `/public/pages` namespace (design doc 06 §5, mirroring `ContentController`). Section structure
 * is protected by `pages.lock_version` optimistic concurrency (doc 06 §14);
 * `content`/`config`/`style` are validated against `@ttu/cms-registry` on every write.
 */
@Controller('pages')
@UseGuards(OptionalJwtAuthGuard, PermissionsGuard)
export class PagesController {
  constructor(
    private readonly pages: PagesRepository,
    private readonly sections: PageSectionsRepository,
    private readonly sectionsService: PageSectionsService,
    private readonly publishing: PagePublishingService,
  ) {}

  @Get()
  async list(@Query() query: PageListQueryDto, @OptionalCurrentUser() user?: AuthenticatedUser) {
    if (user?.permissions.has('page.read')) {
      const { items, total } = await this.pages.listForAdmin(query);
      return { items, ...paginationMeta(query.page, query.pageSize, total) };
    }

    const { items, total } = await this.pages.listPublished(query);
    return {
      items: items.map((item) => toPublicResource(item)),
      ...paginationMeta(query.page, query.pageSize, total),
    };
  }

  /** Declared ahead of `:id` so `by-slug` is never captured by it (mirrors `ContentController`). */
  @Get('by-slug/:locale/:slug')
  async getBySlug(@Param('locale') locale: string, @Param('slug') slug: string) {
    const result = await this.pages.findPublishedBySlug(locale, slug);
    if (!result) throw new NotFoundException(`Page "${slug}" not found`);
    return toPublicResource(result);
  }

  @Get(':id')
  async get(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('locale') locale: string | undefined,
    @OptionalCurrentUser() user?: AuthenticatedUser,
  ) {
    if (user?.permissions.has('page.read')) {
      const page = await this.pages.findById(id);
      if (!page) throw pageNotFound(id);
      const [translations, sections] = await Promise.all([
        this.pages.listTranslations(id),
        this.sections.listWithTranslations(id),
      ]);
      return { ...page, translations, sections };
    }

    if (!locale) {
      throw new ApiError(422, 'validation_error', 'Dữ liệu không hợp lệ', 'locale is required', [
        { field: 'locale', code: 'required', message: 'locale query parameter is required' },
      ]);
    }
    const result = await this.pages.findPublishedById(id, locale);
    if (!result) throw pageNotFound(id);
    return toPublicResource(result);
  }

  @Post()
  @RequirePermission('page.create')
  async create(@Body() dto: CreatePageDto, @CurrentUser() user: AuthenticatedUser) {
    return this.pages.create(dto, user.id);
  }

  @Delete(':id')
  @RequirePermission('page.delete')
  @HttpCode(204)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    const row = await this.pages.softDelete(id, user.id);
    if (!row) throw pageNotFound(id);
  }

  @Post(':id/translations/:locale')
  @RequirePermission('page.edit')
  async upsertTranslation(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('locale') locale: string,
    @Body() dto: UpsertPageTranslationDto,
  ) {
    const page = await this.pages.findById(id);
    if (!page) throw pageNotFound(id);
    return this.pages.upsertTranslation(id, locale, dto);
  }

  @Post(':id/locales/:locale/publish')
  @RequirePermission('page.publish')
  async publish(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('locale') locale: string,
    @Body() dto: PublishPageDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.publishing.publish(id, locale, user.id, dto);
  }

  @Post(':id/locales/:locale/preview')
  @RequirePermission('page.read')
  async preview(@Param('id', ParseUUIDPipe) id: string, @Param('locale') locale: string) {
    return this.publishing.preview(id, locale);
  }

  @Get(':id/locales/:locale/revisions')
  @RequirePermission('page.read')
  async listRevisions(@Param('id', ParseUUIDPipe) id: string, @Param('locale') locale: string) {
    return this.publishing.listRevisions(id, locale);
  }

  @Post(':id/locales/:locale/restore/:revisionId')
  @RequirePermission('page.restore')
  async restore(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('locale') locale: string,
    @Param('revisionId', ParseUUIDPipe) revisionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.publishing.restore(id, locale, revisionId, user.id);
  }

  @Post(':id/sections')
  @RequirePermission('page.edit')
  async createSection(
    @Param('id', ParseUUIDPipe) pageId: string,
    @Body() dto: CreatePageSectionDto,
  ) {
    const page = await this.pages.findById(pageId);
    if (!page) throw pageNotFound(pageId);
    return this.sectionsService.createSection(pageId, dto);
  }

  @Patch(':id/sections/:sectionId')
  @RequirePermission('page.edit')
  async updateSection(
    @Param('id', ParseUUIDPipe) pageId: string,
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @Body() dto: UpdatePageSectionDto,
  ) {
    const section = await this.requireOwnedSection(pageId, sectionId);
    return this.sectionsService.updateSection(section, dto);
  }

  @Delete(':id/sections/:sectionId')
  @RequirePermission('page.edit')
  @HttpCode(204)
  async removeSection(
    @Param('id', ParseUUIDPipe) pageId: string,
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @Query('expectedLockVersion', ParseIntPipe) expectedLockVersion: number,
  ): Promise<void> {
    const section = await this.requireOwnedSection(pageId, sectionId);
    await this.sectionsService.removeSection(section, expectedLockVersion);
  }

  @Post(':id/sections/reorder')
  @RequirePermission('page.edit')
  async reorderSections(
    @Param('id', ParseUUIDPipe) pageId: string,
    @Body() dto: ReorderPageSectionsDto,
  ) {
    const page = await this.pages.findById(pageId);
    if (!page) throw pageNotFound(pageId);
    const currentSections = await this.sections.listByPage(pageId);
    await this.sectionsService.reorderSections(
      pageId,
      currentSections,
      dto.order,
      dto.expectedLockVersion,
    );
    return this.sections.listByPage(pageId);
  }

  @Post(':id/sections/:sectionId/translations/:locale')
  @RequirePermission('page.edit')
  async upsertSectionTranslation(
    @Param('id', ParseUUIDPipe) pageId: string,
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @Param('locale') locale: string,
    @Body() dto: UpsertPageSectionTranslationDto,
  ) {
    const section = await this.requireOwnedSection(pageId, sectionId);
    return this.sectionsService.upsertTranslation(section, locale, dto.content);
  }

  private async requireOwnedSection(pageId: string, sectionId: string) {
    const section = await this.sections.findById(sectionId);
    if (!section || section.pageId !== pageId) throw sectionNotFound(sectionId);
    return section;
  }
}

function toPublicResource(item: PageWithRevision) {
  const translation = item.snapshot.translation;

  // API never returns database internals (created_by, updated_at, deleted_at, lock_version, ...)
  // to an unprivileged caller — only the contract fields a visitor's page actually needs, and only
  // the sections that were visible at publish time (doc 06 §7.1, mirrors `ContentController`).
  return {
    id: item.id,
    pageType: item.pageType,
    slug: translation.slug,
    title: translation.title,
    seo: {
      title: translation.seoTitle,
      description: translation.seoDescription,
      ogTitle: translation.ogTitle,
      ogDescription: translation.ogDescription,
      canonicalUrl: translation.canonicalUrl,
      robotsIndex: translation.robotsIndex,
      robotsFollow: translation.robotsFollow,
    },
    sections: item.snapshot.sections
      .filter((section) => section.isVisible)
      .map((section) => ({
        id: section.id,
        componentKey: section.componentKey,
        componentVersion: section.componentVersion,
        content: section.content,
        config: section.config,
        style: section.style,
      })),
    publishedAt: item.publishedAt,
  };
}

function pageNotFound(id: string): ApiError {
  return new ApiError(404, 'not_found', 'Không tìm thấy tài nguyên', `Page "${id}" not found`);
}

function sectionNotFound(id: string): ApiError {
  return new ApiError(404, 'not_found', 'Không tìm thấy tài nguyên', `Section "${id}" not found`);
}
