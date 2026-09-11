import type { Page, PageTranslation, PageType } from '../db/schema';

/**
 * One `page_sections` row plus its resolved content for the locale being published (design doc 02
 * §10). `componentKey`/`componentVersion`/`config`/`style` are locale-independent (doc 02 §8);
 * `content` is the one part that differs per locale.
 */
export interface PageSectionSnapshot {
  id: string;
  componentKey: string;
  componentVersion: number;
  sortOrder: number;
  isVisible: boolean;
  config: Record<string, unknown>;
  style: Record<string, unknown>;
  content: Record<string, unknown>;
}

/**
 * What a `page_revisions.snapshot` holds — enough to reconstruct the published locale and, per the
 * existing `ContentSnapshot`/`content.restore()` precedent, enough to restore a draft from it (doc
 * 02 §9-10). `sections` captures the _entire_ shared structure at publish time, not just this
 * locale's slice of it — restoring from an old revision therefore replaces the current shared
 * section structure for every locale, exactly as `content.restore()` already does for `events`.
 */
export interface PageSnapshot {
  page: {
    pageType: PageType;
  };
  translation: {
    slug: string;
    path: string;
    title: string;
    seoTitle: string | null;
    seoDescription: string | null;
    ogTitle: string | null;
    ogDescription: string | null;
    ogImageId: string | null;
    canonicalUrl: string | null;
    robotsIndex: boolean;
    robotsFollow: boolean;
  };
  sections: PageSectionSnapshot[];
}

/**
 * Read-only counterpart to `PageSnapshot` (design doc 02 §9 / doc 06 §5.2, §10): the exact same
 * resolved-and-validated draft state `publish()` would snapshot, returned to the caller instead of
 * persisted. `page`/`translation` carry their full row shape (not the narrower fields
 * `page_revisions.snapshot` needs) since a preview response has no storage-size constraint and the
 * caller benefits from `translation.status`/`publishedAt`/etc.
 */
export interface PagePreview {
  pageId: string;
  locale: string;
  page: Pick<Page, 'id' | 'pageType' | 'lockVersion'>;
  translation: PageTranslation;
  sections: PageSectionSnapshot[];
}
