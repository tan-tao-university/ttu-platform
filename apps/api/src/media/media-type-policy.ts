/**
 * Media allowlist and per-type policy (design doc 08 §9-11). SVG is deliberately excluded — doc 08
 * §10: without a trusted sanitizer, an XML-based image format can carry scripts/event handlers, so
 * v1 uses PNG/WebP for logos and icons instead.
 */

const MB = 1024 * 1024;

export interface MediaTypePolicy {
  /** Backend-assigned extension for generated storage keys — never taken from the client (§6). */
  extension: string;
  maxBytes: number;
  /**
   * Magic-byte check so a renamed/mislabeled file can't slip past the declared `Content-Type` (§9:
   * "file signature/magic bytes ở mức phù hợp").
   */
  isValidSignature: (buffer: Buffer) => boolean;
}

export const MEDIA_TYPE_POLICIES: Readonly<Record<string, MediaTypePolicy>> = {
  'image/jpeg': {
    extension: 'jpg',
    maxBytes: 10 * MB,
    isValidSignature: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  'image/png': {
    extension: 'png',
    maxBytes: 10 * MB,
    isValidSignature: (b) =>
      b.length >= 8 &&
      b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  },
  'image/webp': {
    extension: 'webp',
    maxBytes: 10 * MB,
    isValidSignature: (b) =>
      b.length >= 12 &&
      b.subarray(0, 4).toString('ascii') === 'RIFF' &&
      b.subarray(8, 12).toString('ascii') === 'WEBP',
  },
  'application/pdf': {
    extension: 'pdf',
    maxBytes: 50 * MB,
    isValidSignature: (b) => b.length >= 5 && b.subarray(0, 5).toString('ascii') === '%PDF-',
  },
};

export const IMAGE_MIME_TYPES: ReadonlySet<string> = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

/** Multer's hard cap — the largest limit any allowed type permits (§11: PDF at 50 MB). */
export const MAX_UPLOAD_BYTES = Math.max(
  ...Object.values(MEDIA_TYPE_POLICIES).map((policy) => policy.maxBytes),
);
