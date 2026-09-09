/**
 * Media reference types.
 *
 * In production, media is stored in MinIO. The database only holds
 * metadata + a stable reference id. Components accept a `MediaReference`
 * prop rather than a raw URL, so the renderer can resolve URLs centrally.
 */

export interface MediaReference {
  /** Stable id from MinIO / media service. */
  id: string;
  /** MIME type, e.g. `image/jpeg`, `image/png`, `video/mp4`. */
  mime: string;
  /** Width in px (for images / videos). */
  width?: number;
  /** Height in px. */
  height?: number;
  /** Alt text — required for accessibility. Localized separately when needed. */
  alt?: string;
  /** Caption — typically localized. */
  caption?: string;
  /** Blur data URL for placeholder while loading. */
  blurDataUrl?: string;
}

/**
 * Discriminated helper to check if a value is a media reference.
 */
export function isMediaReference(value: unknown): value is MediaReference {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof (value as MediaReference).id === "string"
  );
}
