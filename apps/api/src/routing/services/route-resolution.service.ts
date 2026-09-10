import { Injectable } from '@nestjs/common';
import { ApiError } from '../../common/http/api-error';
import { RedirectsRepository } from '../../redirects/repositories/redirects.repository';
import type { PublicRoute } from '../../db/schema';
import { PublicRoutesRepository } from '../repositories/public-routes.repository';
import type { RouteResolution } from '../route-resolution.types';

/**
 * Implements design doc 05 §12.1's exact resolve order for `apps/web`: a live `public_routes` entry
 * always wins; if none exists, fall through to `redirects` (locale-specific before the global
 * `locale IS NULL` fallback tier); otherwise `404`. This is a routing decision only - it returns a
 * pointer (`pageId`/`contentId`) or a redirect target, never the rendered resource itself, so it
 * never duplicates `PagesController`'s/`ContentController`'s own delivery-view logic.
 */
@Injectable()
export class RouteResolutionService {
  constructor(
    private readonly publicRoutes: PublicRoutesRepository,
    private readonly redirects: RedirectsRepository,
  ) {}

  async resolve(locale: string, path: string): Promise<RouteResolution> {
    const route = await this.publicRoutes.findByLocaleAndPath(locale, path);
    if (route) return resolveRouteTarget(route);

    const matches = await this.redirects.findActiveMatchesForLocale(locale, path);
    const redirect =
      matches.find((r) => r.locale === locale) ?? matches.find((r) => r.locale === null);
    if (redirect) {
      return {
        type: 'redirect',
        destinationPath: redirect.destinationPath,
        statusCode: redirect.statusCode,
      };
    }

    throw routeNotFound(locale, path);
  }
}

/** `public_routes_exactly_one_target_check` guarantees this never falls through in practice. */
function resolveRouteTarget(route: PublicRoute): RouteResolution {
  if (route.targetType === 'PAGE' && route.pageId) return { type: 'page', pageId: route.pageId };
  if (route.targetType === 'CONTENT' && route.contentId) {
    return { type: 'content', contentId: route.contentId };
  }
  throw new ApiError(
    500,
    'internal_error',
    'Lỗi hệ thống',
    `public_routes row "${route.id}" violates its target-type invariant`,
  );
}

function routeNotFound(locale: string, path: string): ApiError {
  return new ApiError(
    404,
    'not_found',
    'Không tìm thấy tài nguyên',
    `No published route or redirect for "${path}" (${locale})`,
  );
}
