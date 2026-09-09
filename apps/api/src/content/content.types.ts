import type { ContentType, Event } from '../db/schema';

/** What a `content_revisions.snapshot` actually holds — enough to reconstruct the
 *  published locale at that point in time and to restore a draft from it (design doc 05
 *  §8.4, doc 06 §10-11). Field-for-field with `content_translations`' editable columns plus
 *  the shared `contents.type` and the `events` row when the item is an EVENT. */
export interface ContentSnapshot {
  item: {
    type: ContentType;
    featuredMediaId: string | null;
  };
  translation: {
    slug: string;
    path: string;
    title: string;
    excerpt: string | null;
    body: unknown;
    bodyFormat: string;
    seoTitle: string | null;
    seoDescription: string | null;
    ogTitle: string | null;
    ogDescription: string | null;
    ogImageId: string | null;
    canonicalUrl: string | null;
    robotsIndex: boolean;
    robotsFollow: boolean;
  };
  event: Omit<Event, 'contentId'> | null;
}
