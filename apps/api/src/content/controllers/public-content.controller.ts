import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { paginationMeta } from '../../common/dto/pagination-query.dto';
import { PublicContentListQueryDto } from '../dto/public-content-list-query.dto';
import { ContentAssignmentsRepository } from '../repositories/content-assignments.repository';
import {
  ContentItemsRepository,
  type ContentItemWithRevision,
} from '../repositories/content-items.repository';

/**
 * Public API (doc 06 §5.1): no auth, published-and-active only, never a draft field. Every
 * query resolves locale first, then reads the *published revision* of that locale — never
 * the shared draft (doc 06 §9), including for the `slug` a request is looked up by: see
 * `ContentItemsRepository.listPublished`/`findPublishedBySlug`.
 */
@Controller('public/content')
export class PublicContentController {
  constructor(
    private readonly contentItems: ContentItemsRepository,
    private readonly assignments: ContentAssignmentsRepository,
  ) {}

  @Get()
  async list(@Query() query: PublicContentListQueryDto) {
    const { items, total } = await this.contentItems.listPublished(query);
    return {
      items: items.map((item) => toPublicResource(item)),
      ...paginationMeta(query.page, query.pageSize, total),
    };
  }

  @Get(':slug')
  async get(@Param('slug') slug: string, @Query('locale') locale = 'vi') {
    const result = await this.contentItems.findPublishedBySlug(locale, slug);
    if (!result) throw new NotFoundException(`Content "${slug}" not found`);

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

  // API never returns database internals (created_by, updated_at, deleted_at, ...) to the
  // public — only the contract fields a visitor's page actually needs (doc 06 §7.1).
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
