import type { SiteSetting } from '@/db/schema';
import { SiteSettingsService } from '@/settings/services/site-settings.service';

function settingFixture(overrides: Partial<SiteSetting> = {}): SiteSetting {
  return {
    key: 'features.public',
    value: { showEventsWidget: true, maintenanceMode: false },
    schemaVersion: 1,
    updatedBy: null,
    updatedAt: new Date(),
    ...overrides,
  };
}

function serviceWith(overrides: Record<string, unknown> = {}) {
  const settings = {
    list: jest.fn(),
    findByKey: jest.fn(),
    upsert: jest.fn(),
    ...overrides,
  };
  return { service: new SiteSettingsService(settings as never), settings };
}

describe('SiteSettingsService', () => {
  describe('list', () => {
    it('passes through to the repository', async () => {
      const rows = [settingFixture()];
      const { service, settings } = serviceWith({ list: jest.fn().mockResolvedValue(rows) });

      await expect(service.list()).resolves.toBe(rows);
      expect(settings.list).toHaveBeenCalled();
    });
  });

  describe('findByKey', () => {
    it('rejects a key that is not in the catalog', async () => {
      const { service } = serviceWith();

      await expect(service.findByKey('not.a.real.key')).rejects.toMatchObject({ status: 404 });
    });

    it('404s a known catalog key that has never been set', async () => {
      const { service } = serviceWith({ findByKey: jest.fn().mockResolvedValue(undefined) });

      await expect(service.findByKey('site.contact')).rejects.toMatchObject({ status: 404 });
    });

    it('returns the row for a known, set key', async () => {
      const row = settingFixture();
      const { service } = serviceWith({ findByKey: jest.fn().mockResolvedValue(row) });

      await expect(service.findByKey('features.public')).resolves.toBe(row);
    });
  });

  describe('upsert', () => {
    it('rejects a key that is not in the catalog', async () => {
      const { service, settings } = serviceWith();

      await expect(service.upsert('not.a.real.key', { value: {} }, 'user-1')).rejects.toMatchObject(
        {
          status: 404,
        },
      );
      expect(settings.upsert).not.toHaveBeenCalled();
    });

    it('rejects a value missing a required field, naming the exact field', async () => {
      const { service, settings } = serviceWith();

      await expect(
        service.upsert('site.contact', { value: { phone: '123', email: 'a@b.com' } }, 'user-1'),
      ).rejects.toMatchObject({
        status: 422,
        errors: expect.arrayContaining([expect.objectContaining({ field: 'value.workingHours' })]),
      });
      expect(settings.upsert).not.toHaveBeenCalled();
    });

    it('rejects an unrecognized field on a strict schema', async () => {
      const { service, settings } = serviceWith();

      await expect(
        service.upsert(
          'site.social_links',
          { value: { facebook: 'https://facebook.com/x', tiktok: 'https://tiktok.com/x' } },
          'user-1',
        ),
      ).rejects.toMatchObject({
        status: 422,
        errors: [expect.objectContaining({ field: 'value.tiktok', code: 'unrecognized_keys' })],
      });
      expect(settings.upsert).not.toHaveBeenCalled();
    });

    it('rejects an invalid URL for a link field', async () => {
      const { service } = serviceWith();

      await expect(
        service.upsert('site.social_links', { value: { facebook: 'not-a-url' } }, 'user-1'),
      ).rejects.toMatchObject({ status: 422 });
    });

    it('applies schema defaults and persists the parsed value', async () => {
      const { service, settings } = serviceWith({
        upsert: jest
          .fn()
          .mockImplementation((key, value) => Promise.resolve(settingFixture({ key, value }))),
      });

      await service.upsert('features.public', { value: {} }, 'user-1');

      expect(settings.upsert).toHaveBeenCalledWith(
        'features.public',
        { showEventsWidget: true, maintenanceMode: false },
        'user-1',
      );
    });

    it('accepts a fully valid site.contact payload', async () => {
      const { service, settings } = serviceWith({
        upsert: jest
          .fn()
          .mockImplementation((key, value) => Promise.resolve(settingFixture({ key, value }))),
      });

      const value = {
        phone: '(+84) 272 376 9216',
        email: 'info@ttu.edu.vn',
        workingHours: 'Thứ 2 – Thứ 6, 8:00 sáng – 4:30 chiều',
        mapEmbedUrl: null,
        organizationNameByLocale: { vi: 'Đại học Tân Tạo', en: 'Tan Tao University' },
        addressByLocale: { vi: 'Tây Ninh', en: 'Tay Ninh' },
      };

      await service.upsert('site.contact', { value }, 'user-1');

      expect(settings.upsert).toHaveBeenCalledWith('site.contact', value, 'user-1');
    });
  });
});
