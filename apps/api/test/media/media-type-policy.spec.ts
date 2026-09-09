import { IMAGE_MIME_TYPES, MAX_UPLOAD_BYTES, MEDIA_TYPE_POLICIES } from '@/media/media-type-policy';

describe('MEDIA_TYPE_POLICIES', () => {
  it('accepts a real JPEG signature and rejects a PNG signature under the JPEG policy', () => {
    const jpeg = MEDIA_TYPE_POLICIES['image/jpeg'];
    expect(jpeg.isValidSignature(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toBe(true);
    expect(jpeg.isValidSignature(Buffer.from([0x89, 0x50, 0x4e, 0x47]))).toBe(false);
  });

  it('accepts a real PNG signature and rejects a truncated one', () => {
    const png = MEDIA_TYPE_POLICIES['image/png'];
    expect(
      png.isValidSignature(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    ).toBe(true);
    expect(png.isValidSignature(Buffer.from([0x89, 0x50, 0x4e, 0x47]))).toBe(false);
  });

  it('accepts a real WebP RIFF/WEBP container and rejects a plain RIFF/WAVE one', () => {
    const webp = MEDIA_TYPE_POLICIES['image/webp'];
    const validWebp = Buffer.concat([
      Buffer.from('RIFF', 'ascii'),
      Buffer.from([0, 0, 0, 0]),
      Buffer.from('WEBP', 'ascii'),
    ]);
    const wav = Buffer.concat([
      Buffer.from('RIFF', 'ascii'),
      Buffer.from([0, 0, 0, 0]),
      Buffer.from('WAVE', 'ascii'),
    ]);
    expect(webp.isValidSignature(validWebp)).toBe(true);
    expect(webp.isValidSignature(wav)).toBe(false);
  });

  it('accepts a real PDF signature and rejects plain text pretending to be one', () => {
    const pdf = MEDIA_TYPE_POLICIES['application/pdf'];
    expect(pdf.isValidSignature(Buffer.from('%PDF-1.7\n', 'ascii'))).toBe(true);
    expect(pdf.isValidSignature(Buffer.from('not a pdf', 'ascii'))).toBe(false);
  });

  it('excludes SVG from the allowlist (doc 08 §10: no trusted sanitizer in v1)', () => {
    expect(MEDIA_TYPE_POLICIES['image/svg+xml']).toBeUndefined();
  });

  it('caps PDFs at 50 MB and images at 10 MB (doc 08 §11)', () => {
    expect(MEDIA_TYPE_POLICIES['application/pdf'].maxBytes).toBe(50 * 1024 * 1024);
    for (const mimeType of IMAGE_MIME_TYPES) {
      expect(MEDIA_TYPE_POLICIES[mimeType].maxBytes).toBe(10 * 1024 * 1024);
    }
  });

  it('sets the shared multer cap to the largest per-type limit so no allowed upload is rejected before type-specific validation runs', () => {
    const largest = Math.max(...Object.values(MEDIA_TYPE_POLICIES).map((p) => p.maxBytes));
    expect(MAX_UPLOAD_BYTES).toBe(largest);
  });
});
