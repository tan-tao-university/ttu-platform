import { ApiError } from '@/common/http/api-error';
import type { PublicRoute, Redirect } from '@/db/schema';
import { RouteResolutionService } from '@/routing/services/route-resolution.service';

function publicRouteFixture(overrides: Partial<PublicRoute> = {}): PublicRoute {
  return {
    id: 'route-1',
    locale: 'vi',
    path: '/gioi-thieu',
    targetType: 'PAGE',
    pageId: 'page-1',
    contentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function redirectFixture(overrides: Partial<Redirect> = {}): Redirect {
  return {
    id: 'redirect-1',
    locale: 'vi',
    sourcePath: '/old',
    destinationPath: '/new',
    statusCode: 301,
    isActive: true,
    createdBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function serviceWith(
  overrides: {
    publicRoutes?: Record<string, unknown>;
    redirects?: Record<string, unknown>;
  } = {},
) {
  const publicRoutes = {
    findByLocaleAndPath: jest.fn().mockResolvedValue(undefined),
    ...overrides.publicRoutes,
  };
  const redirects = {
    findActiveMatchesForLocale: jest.fn().mockResolvedValue([]),
    ...overrides.redirects,
  };
  const service = new RouteResolutionService(publicRoutes as never, redirects as never);
  return { service, publicRoutes, redirects };
}

describe('RouteResolutionService', () => {
  it('resolves a PAGE public_routes entry to a page pointer', async () => {
    const { service } = serviceWith({
      publicRoutes: {
        findByLocaleAndPath: jest.fn().mockResolvedValue(publicRouteFixture()),
      },
    });

    await expect(service.resolve('vi', '/gioi-thieu')).resolves.toEqual({
      type: 'page',
      pageId: 'page-1',
    });
  });

  it('resolves a CONTENT public_routes entry to a content pointer', async () => {
    const { service } = serviceWith({
      publicRoutes: {
        findByLocaleAndPath: jest
          .fn()
          .mockResolvedValue(
            publicRouteFixture({ targetType: 'CONTENT', pageId: null, contentId: 'content-1' }),
          ),
      },
    });

    await expect(service.resolve('vi', '/tin-tuc/abc')).resolves.toEqual({
      type: 'content',
      contentId: 'content-1',
    });
  });

  it('falls through to a locale-specific redirect when no public route matches', async () => {
    const { service, redirects } = serviceWith({
      redirects: {
        findActiveMatchesForLocale: jest.fn().mockResolvedValue([redirectFixture()]),
      },
    });

    await expect(service.resolve('vi', '/old')).resolves.toEqual({
      type: 'redirect',
      destinationPath: '/new',
      statusCode: 301,
    });
    expect(redirects.findActiveMatchesForLocale).toHaveBeenCalledWith('vi', '/old');
  });

  it('prefers a locale-specific redirect over the global fallback for the same source', async () => {
    const { service } = serviceWith({
      redirects: {
        findActiveMatchesForLocale: jest
          .fn()
          .mockResolvedValue([
            redirectFixture({ locale: null, destinationPath: '/global-target' }),
            redirectFixture({ locale: 'vi', destinationPath: '/locale-target' }),
          ]),
      },
    });

    await expect(service.resolve('vi', '/old')).resolves.toMatchObject({
      destinationPath: '/locale-target',
    });
  });

  it('falls back to a global redirect when no locale-specific one matches', async () => {
    const { service } = serviceWith({
      redirects: {
        findActiveMatchesForLocale: jest
          .fn()
          .mockResolvedValue([
            redirectFixture({ locale: null, destinationPath: '/global-target' }),
          ]),
      },
    });

    await expect(service.resolve('vi', '/old')).resolves.toMatchObject({
      destinationPath: '/global-target',
    });
  });

  it('404s when neither a public route nor a redirect matches', async () => {
    const { service } = serviceWith();

    await expect(service.resolve('vi', '/nowhere')).rejects.toMatchObject({ status: 404 });
  });

  it('never checks redirects once a public route already resolved the path', async () => {
    const { service, redirects } = serviceWith({
      publicRoutes: { findByLocaleAndPath: jest.fn().mockResolvedValue(publicRouteFixture()) },
    });

    await service.resolve('vi', '/gioi-thieu');

    expect(redirects.findActiveMatchesForLocale).not.toHaveBeenCalled();
  });

  it('500s on a public_routes row that violates its own target-type invariant', async () => {
    const { service } = serviceWith({
      publicRoutes: {
        findByLocaleAndPath: jest
          .fn()
          .mockResolvedValue(publicRouteFixture({ targetType: 'PAGE', pageId: null })),
      },
    });

    await expect(service.resolve('vi', '/broken')).rejects.toThrow(ApiError);
  });
});
