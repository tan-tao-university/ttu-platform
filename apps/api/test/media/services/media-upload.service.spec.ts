import { ApiError } from '@/common/http/api-error';
import { MediaUploadService } from '@/media/services/media-upload.service';

/** Smallest valid PNG (1x1 transparent pixel) — real bytes so `imageSize()` actually parses it. */
const TINY_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

function fileFixture(overrides: Partial<Express.Multer.File> = {}): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: 'photo.png',
    encoding: '7bit',
    mimetype: 'image/png',
    buffer: Buffer.from(TINY_PNG_BASE64, 'base64'),
    size: Buffer.from(TINY_PNG_BASE64, 'base64').length,
    stream: undefined as never,
    destination: '',
    filename: '',
    path: '',
    ...overrides,
  };
}

function serviceWith() {
  const storage = {
    bucket: 'ttu-public-media',
    putObject: jest.fn().mockResolvedValue(undefined),
    deleteObject: jest.fn().mockResolvedValue(undefined),
    objectExists: jest.fn(),
    getDeliveryUrl: jest.fn(),
  };
  const mediaAssets = { create: jest.fn() };
  const service = new MediaUploadService(storage as never, mediaAssets as never);
  return { service, storage, mediaAssets };
}

describe('MediaUploadService', () => {
  it('rejects a MIME type outside the allowlist', async () => {
    const { service } = serviceWith();
    await expect(
      service.upload(fileFixture({ mimetype: 'application/zip' }), 'user-1'),
    ).rejects.toThrow(ApiError);
  });

  it("rejects a file that exceeds its type's size limit", async () => {
    const { service } = serviceWith();
    await expect(service.upload(fileFixture({ size: 11 * 1024 * 1024 }), 'user-1')).rejects.toThrow(
      ApiError,
    );
  });

  it('rejects a file whose content does not match its declared MIME type', async () => {
    const { service } = serviceWith();
    await expect(
      service.upload(
        fileFixture({ mimetype: 'image/jpeg', buffer: Buffer.from(TINY_PNG_BASE64, 'base64') }),
        'user-1',
      ),
    ).rejects.toThrow(ApiError);
  });

  it('extracts real width/height from a valid image and persists a backend-generated key', async () => {
    const { service, storage, mediaAssets } = serviceWith();
    mediaAssets.create.mockImplementation((input) => Promise.resolve({ id: 'asset-1', ...input }));

    const asset = await service.upload(fileFixture(), 'user-1');

    expect(asset.width).toBe(1);
    expect(asset.height).toBe(1);
    expect(asset.storageKey).toMatch(/^images\/\d{4}\/\d{2}\/[0-9a-f-]{36}\.png$/);
    expect(asset.originalFileName).toBe('photo.png');
    expect(storage.putObject).toHaveBeenCalledWith(
      asset.storageKey,
      expect.any(Buffer),
      'image/png',
    );
  });

  it('deletes the just-written object if the metadata insert fails, then rethrows', async () => {
    const { service, storage, mediaAssets } = serviceWith();
    const dbError = new Error('insert failed');
    mediaAssets.create.mockRejectedValue(dbError);

    await expect(service.upload(fileFixture(), 'user-1')).rejects.toThrow(dbError);
    expect(storage.putObject).toHaveBeenCalledTimes(1);
    expect(storage.deleteObject).toHaveBeenCalledWith(storage.putObject.mock.calls[0][0]);
  });
});
