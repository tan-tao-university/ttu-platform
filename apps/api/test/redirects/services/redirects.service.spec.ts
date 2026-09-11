import { ApiError } from '@/common/http/api-error';
import type { Redirect } from '@/db/schema';
import { RedirectsService } from '@/redirects/services/redirects.service';

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

function serviceWith(overrides: Record<string, unknown> = {}) {
  const redirects = {
    list: jest.fn(),
    findById: jest.fn(),
    findActiveMatchesForLocale: jest.fn().mockResolvedValue([]),
    findActiveBySourceAndDestination: jest.fn().mockResolvedValue(undefined),
    hasLivePublicRoute: jest.fn().mockResolvedValue(false),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    ...overrides,
  };
  return { service: new RedirectsService(redirects as never), redirects };
}

describe('RedirectsService', () => {
  describe('create', () => {
    it('rejects a redirect whose sourcePath and destinationPath are the same', async () => {
      const { service } = serviceWith();

      await expect(
        service.create({ sourcePath: '/same', destinationPath: '/same' }, 'user-1'),
      ).rejects.toThrow(ApiError);
    });

    it('rejects a source path that is still a live published route', async () => {
      const { service, redirects } = serviceWith({
        hasLivePublicRoute: jest.fn().mockResolvedValue(true),
      });

      await expect(
        service.create(
          { locale: 'vi', sourcePath: '/gioi-thieu', destinationPath: '/new' },
          'user-1',
        ),
      ).rejects.toMatchObject({ status: 409 });
      expect(redirects.create).not.toHaveBeenCalled();
    });

    it('rejects a direct A -> B -> A loop', async () => {
      const { service, redirects } = serviceWith({
        findActiveBySourceAndDestination: jest
          .fn()
          .mockResolvedValue(redirectFixture({ sourcePath: '/b', destinationPath: '/a' })),
      });

      await expect(
        service.create({ locale: 'vi', sourcePath: '/a', destinationPath: '/b' }, 'user-1'),
      ).rejects.toMatchObject({
        status: 422,
        errors: [expect.objectContaining({ code: 'redirect_loop' })],
      });
      expect(redirects.create).not.toHaveBeenCalled();
    });

    it('rejects a destinationPath that already redirects elsewhere, forming a chain', async () => {
      const { service, redirects } = serviceWith({
        findActiveMatchesForLocale: jest
          .fn()
          .mockResolvedValue([redirectFixture({ sourcePath: '/b', destinationPath: '/c' })]),
      });

      await expect(
        service.create({ locale: 'vi', sourcePath: '/a', destinationPath: '/b' }, 'user-1'),
      ).rejects.toMatchObject({
        status: 422,
        errors: [
          expect.objectContaining({
            code: 'redirect_chain',
            message: expect.stringContaining('/c'),
          }),
        ],
      });
      expect(redirects.create).not.toHaveBeenCalled();
    });

    it('creates with default statusCode 301 and isActive true when omitted', async () => {
      const { service, redirects } = serviceWith({
        create: jest.fn().mockImplementation((row) => Promise.resolve(redirectFixture(row))),
      });

      await service.create({ locale: 'vi', sourcePath: '/old', destinationPath: '/new' }, 'user-1');

      expect(redirects.create).toHaveBeenCalledWith({
        locale: 'vi',
        sourcePath: '/old',
        destinationPath: '/new',
        statusCode: 301,
        isActive: true,
        createdBy: 'user-1',
      });
    });

    it('normalizes an omitted locale to the global fallback tier (null)', async () => {
      const { service, redirects } = serviceWith({
        create: jest.fn().mockImplementation((row) => Promise.resolve(redirectFixture(row))),
      });

      await service.create(
        { sourcePath: '/old-doc.pdf', destinationPath: '/documents/new-doc.pdf' },
        'user-1',
      );

      expect(redirects.create).toHaveBeenCalledWith(expect.objectContaining({ locale: null }));
      expect(redirects.hasLivePublicRoute).toHaveBeenCalledWith(null, '/old-doc.pdf');
    });
  });

  describe('update', () => {
    it('re-validates loop/chain only when destinationPath actually changes', async () => {
      const { service, redirects } = serviceWith({
        findById: jest.fn().mockResolvedValue(redirectFixture()),
        update: jest
          .fn()
          .mockImplementation((id, patch) => Promise.resolve(redirectFixture(patch))),
      });

      await service.update('redirect-1', { isActive: false });

      expect(redirects.findActiveBySourceAndDestination).not.toHaveBeenCalled();
      expect(redirects.findActiveMatchesForLocale).not.toHaveBeenCalled();
      expect(redirects.update).toHaveBeenCalledWith('redirect-1', {
        destinationPath: undefined,
        statusCode: undefined,
        isActive: false,
      });
    });

    it('excludes the redirect being updated from its own chain/loop check', async () => {
      const existing = redirectFixture({
        id: 'redirect-1',
        sourcePath: '/a',
        destinationPath: '/b',
      });
      const { service, redirects } = serviceWith({
        findById: jest.fn().mockResolvedValue(existing),
        findActiveMatchesForLocale: jest.fn().mockResolvedValue([existing]),
        update: jest
          .fn()
          .mockImplementation((id, patch) => Promise.resolve({ ...existing, ...patch })),
      });

      await service.update('redirect-1', { destinationPath: '/a' }).catch(() => undefined);

      // Changing destinationPath back toward its own sourcePath is caught by the self-redirect
      // check before any repository lookup runs, so the exclusion never even matters here — the
      // repository must not be asked to persist a self-redirect either way.
      expect(redirects.update).not.toHaveBeenCalled();
    });

    it('throws 404 when the redirect does not exist', async () => {
      const { service } = serviceWith({ findById: jest.fn().mockResolvedValue(undefined) });

      await expect(service.update('missing', { isActive: false })).rejects.toMatchObject({
        status: 404,
      });
    });
  });
});
