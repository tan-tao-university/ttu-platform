import { Injectable } from '@nestjs/common';
import {
  ComponentNotRegisteredError,
  SectionValidationError,
  getComponentDefinition,
  validateSectionContent,
  validateSectionStructure,
} from '@ttu/cms-registry';
import { ApiError } from '../../common/http/api-error';
import type { PageSection, PageSectionTranslation } from '../../db/schema';
import type { CreatePageSectionDto } from '../dto/create-page-section.dto';
import type { UpdatePageSectionDto } from '../dto/update-page-section.dto';
import { LOCK_CONFLICT, PageSectionsRepository } from '../repositories/page-sections.repository';

/**
 * The one place `config`/`style`/`content` are checked against the Component Registry before ever
 * reaching the database (design doc 02 §11) — every write path in `PagesController` routes through
 * here rather than calling `PageSectionsRepository` directly, so validation can never be bypassed
 * by a route that forgets to call it.
 */
@Injectable()
export class PageSectionsService {
  constructor(private readonly sections: PageSectionsRepository) {}

  async createSection(pageId: string, dto: CreatePageSectionDto): Promise<PageSection> {
    const definition = this.requireDefinition(dto.componentKey, dto.componentVersion);
    const validated = this.validateStructure(dto.componentKey, dto.componentVersion, {
      config: dto.config ?? definition.defaultConfig,
      style: dto.style ?? definition.defaultStyle,
    });
    const row = await this.sections.createWithLock(pageId, dto.expectedLockVersion, {
      componentKey: dto.componentKey,
      componentVersion: dto.componentVersion,
      sortOrder: dto.sortOrder ?? 0,
      isVisible: dto.isVisible ?? true,
      config: validated.config,
      style: validated.style,
    });
    if (row === undefined) throw lockConflict(pageId);
    return row;
  }

  async updateSection(section: PageSection, dto: UpdatePageSectionDto): Promise<PageSection> {
    const validated = this.validateStructure(section.componentKey, section.componentVersion, {
      config: dto.config ?? section.config,
      style: dto.style ?? section.style,
    });
    const row = await this.sections.updateWithLock(
      section.id,
      section.pageId,
      dto.expectedLockVersion,
      {
        sortOrder: dto.sortOrder,
        isVisible: dto.isVisible,
        config: dto.config ? validated.config : undefined,
        style: dto.style ? validated.style : undefined,
      },
    );
    if (row === LOCK_CONFLICT) throw lockConflict(section.pageId);
    if (!row) throw sectionNotFound(section.id);
    return row;
  }

  async removeSection(section: PageSection, expectedLockVersion: number): Promise<void> {
    const row = await this.sections.removeWithLock(section.id, section.pageId, expectedLockVersion);
    if (row === LOCK_CONFLICT) throw lockConflict(section.pageId);
    if (!row) throw sectionNotFound(section.id);
  }

  async reorderSections(
    pageId: string,
    currentSections: PageSection[],
    order: string[],
    expectedLockVersion: number,
  ): Promise<void> {
    const currentIds = new Set(currentSections.map((s) => s.id));
    const orderIds = new Set(order);
    if (currentIds.size !== orderIds.size || [...currentIds].some((id) => !orderIds.has(id))) {
      throw new ApiError(
        422,
        'validation_error',
        'Dữ liệu không hợp lệ',
        "order must contain exactly the page's current section IDs",
        [{ field: 'order', code: 'invalid', message: 'Section ID set does not match the page' }],
      );
    }
    const result = await this.sections.reorderWithLock(pageId, expectedLockVersion, order);
    if (result === LOCK_CONFLICT) throw lockConflict(pageId);
  }

  async upsertTranslation(
    section: PageSection,
    locale: string,
    content: Record<string, unknown>,
  ): Promise<PageSectionTranslation> {
    const validated = this.wrapRegistryErrors(() =>
      validateSectionContent({
        componentKey: section.componentKey,
        componentVersion: section.componentVersion,
        content,
      }),
    );
    return this.sections.upsertTranslation(section.id, locale, validated);
  }

  private requireDefinition(componentKey: string, componentVersion: number) {
    return this.wrapRegistryErrors(() => {
      const definition = getComponentDefinition(componentKey, componentVersion);
      if (!definition) throw new ComponentNotRegisteredError(componentKey, componentVersion);
      return definition;
    });
  }

  private validateStructure(
    componentKey: string,
    componentVersion: number,
    input: { config: unknown; style: unknown },
  ) {
    return this.wrapRegistryErrors(() =>
      validateSectionStructure({ componentKey, componentVersion, ...input }),
    );
  }

  private wrapRegistryErrors<T>(fn: () => T): T {
    try {
      return fn();
    } catch (error) {
      if (error instanceof ComponentNotRegisteredError) {
        throw new ApiError(422, 'validation_error', 'Dữ liệu không hợp lệ', error.message, [
          { field: 'componentKey', code: 'not_registered', message: error.message },
        ]);
      }
      if (error instanceof SectionValidationError) {
        throw new ApiError(
          422,
          'validation_error',
          'Dữ liệu không hợp lệ',
          'Section content/config/style failed component schema validation',
          error.issues,
        );
      }
      throw error;
    }
  }
}

function lockConflict(pageId: string): ApiError {
  return new ApiError(
    409,
    'conflict',
    'Xung đột dữ liệu',
    `Page "${pageId}" was changed by someone else — reload and try again`,
    [
      {
        field: 'expectedLockVersion',
        code: 'stale',
        message: 'Page structure has changed since it was loaded',
      },
    ],
  );
}

function sectionNotFound(id: string): ApiError {
  return new ApiError(404, 'not_found', 'Không tìm thấy tài nguyên', `Section "${id}" not found`);
}
