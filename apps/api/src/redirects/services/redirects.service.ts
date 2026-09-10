import { Injectable } from '@nestjs/common';
import { ApiError } from '../../common/http/api-error';
import { isForeignKeyViolation, isUniqueViolation } from '../../common/db/postgres-error.util';
import type { Redirect } from '../../db/schema';
import type { CreateRedirectDto } from '../dto/create-redirect.dto';
import type { RedirectListQueryDto } from '../dto/redirect-list-query.dto';
import type { UpdateRedirectDto } from '../dto/update-redirect.dto';
import { RedirectsRepository } from '../repositories/redirects.repository';

/**
 * Doc 05 §12.1's business rules the DB's own constraints can't express on their own: a redirect
 * must not shadow a path `public_routes` still serves live, must not create a direct A -> B -> A
 * loop, and must not point at a path that is itself already an active redirect source (a chain) -
 * the caller should point `destinationPath` at the final destination instead. `RedirectsController`
 * is the only write path these rules run through (design doc 06 §11).
 */
@Injectable()
export class RedirectsService {
  constructor(private readonly redirects: RedirectsRepository) {}

  async list(query: RedirectListQueryDto): Promise<{ items: Redirect[]; total: number }> {
    return this.redirects.list(query);
  }

  async findById(id: string): Promise<Redirect> {
    const row = await this.redirects.findById(id);
    if (!row) throw redirectNotFound(id);
    return row;
  }

  async create(dto: CreateRedirectDto, createdBy: string): Promise<Redirect> {
    const locale = dto.locale ?? null;
    assertNoSelfRedirect(dto.sourcePath, dto.destinationPath);
    await this.assertDoesNotShadowLiveRoute(locale, dto.sourcePath);
    await this.assertNoLoop(locale, dto.sourcePath, dto.destinationPath);
    await this.assertNoChain(locale, dto.destinationPath);

    try {
      return await this.redirects.create({
        locale,
        sourcePath: dto.sourcePath,
        destinationPath: dto.destinationPath,
        statusCode: dto.statusCode ?? 301,
        isActive: dto.isActive ?? true,
        createdBy,
      });
    } catch (error) {
      if (isUniqueViolation(error)) throw activeRedirectAlreadyExists(locale, dto.sourcePath);
      if (isForeignKeyViolation(error)) throw unknownLocale(dto.locale as string);
      throw error;
    }
  }

  async update(id: string, dto: UpdateRedirectDto): Promise<Redirect> {
    const existing = await this.findById(id);

    if (dto.destinationPath !== undefined && dto.destinationPath !== existing.destinationPath) {
      assertNoSelfRedirect(existing.sourcePath, dto.destinationPath);
      await this.assertNoLoop(existing.locale, existing.sourcePath, dto.destinationPath, id);
      await this.assertNoChain(existing.locale, dto.destinationPath, id);
    }

    const row = await this.redirects.update(id, {
      destinationPath: dto.destinationPath,
      statusCode: dto.statusCode,
      isActive: dto.isActive,
    });
    if (!row) throw redirectNotFound(id);
    return row;
  }

  async remove(id: string): Promise<void> {
    const row = await this.redirects.remove(id);
    if (!row) throw redirectNotFound(id);
  }

  private async assertDoesNotShadowLiveRoute(
    locale: string | null,
    sourcePath: string,
  ): Promise<void> {
    if (await this.redirects.hasLivePublicRoute(locale, sourcePath)) {
      throw new ApiError(
        409,
        'conflict',
        'Xung đột dữ liệu',
        `"${sourcePath}" is a live published route and cannot also be a redirect source`,
        [
          {
            field: 'sourcePath',
            code: 'live_route',
            message: 'Path currently resolves to published content',
          },
        ],
      );
    }
  }

  private async assertNoLoop(
    locale: string | null,
    sourcePath: string,
    destinationPath: string,
    excludeId?: string,
  ): Promise<void> {
    const reverse = await this.redirects.findActiveBySourceAndDestination(
      locale,
      destinationPath,
      sourcePath,
    );
    if (reverse && reverse.id !== excludeId) {
      throw new ApiError(
        422,
        'validation_error',
        'Dữ liệu không hợp lệ',
        `Redirect "${destinationPath}" -> "${sourcePath}" already exists; this would create a loop`,
        [
          {
            field: 'destinationPath',
            code: 'redirect_loop',
            message: `Would loop back through "${destinationPath}"`,
          },
        ],
      );
    }
  }

  private async assertNoChain(
    locale: string | null,
    destinationPath: string,
    excludeId?: string,
  ): Promise<void> {
    const matches = await this.redirects.findActiveMatchesForLocale(locale, destinationPath);
    const chainedTo = matches.find((row) => row.id !== excludeId);
    if (chainedTo) {
      throw new ApiError(
        422,
        'validation_error',
        'Dữ liệu không hợp lệ',
        `"${destinationPath}" already redirects to "${chainedTo.destinationPath}"; point destinationPath there directly instead of chaining`,
        [
          {
            field: 'destinationPath',
            code: 'redirect_chain',
            message: `Already redirects to "${chainedTo.destinationPath}"`,
          },
        ],
      );
    }
  }
}

function assertNoSelfRedirect(sourcePath: string, destinationPath: string): void {
  if (sourcePath === destinationPath) {
    throw new ApiError(
      422,
      'validation_error',
      'Dữ liệu không hợp lệ',
      'sourcePath and destinationPath must not be the same path',
      [{ field: 'destinationPath', code: 'self_redirect', message: 'Must differ from sourcePath' }],
    );
  }
}

function redirectNotFound(id: string): ApiError {
  return new ApiError(404, 'not_found', 'Không tìm thấy tài nguyên', `Redirect "${id}" not found`);
}

function activeRedirectAlreadyExists(locale: string | null, sourcePath: string): ApiError {
  return new ApiError(
    409,
    'conflict',
    'Xung đột dữ liệu',
    `An active redirect for "${sourcePath}"${locale ? ` (${locale})` : ' (global)'} already exists`,
    [
      {
        field: 'sourcePath',
        code: 'duplicate',
        message: 'An active redirect for this source already exists',
      },
    ],
  );
}

function unknownLocale(locale: string): ApiError {
  return new ApiError(
    422,
    'validation_error',
    'Dữ liệu không hợp lệ',
    `Unknown locale "${locale}"`,
    [{ field: 'locale', code: 'not_found', message: `Locale "${locale}" is not configured` }],
  );
}
