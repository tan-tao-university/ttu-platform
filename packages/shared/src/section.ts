/**
 * Page → Section → Component data model.
 *
 * This is the **logical** shape stored in PostgreSQL.
 * Section components receive a normalized view of this data via their
 * typed props (see `packages/cms-registry`).
 */
import type { Locale } from "./locale";
import type { MediaReference } from "./media";

/**
 * A page is an ordered list of sections.
 *
 * The frontend fetches the published revision of a page by its `slug`
 * for the current `locale` and renders each section in order.
 */
export interface Page {
  id: string;
  slug: string;
  /** SEO metadata, per locale. */
  seo: Partial<Record<Locale, PageSeo>>;
  /** Ordered sections. */
  sections: PageSection[];
  /** When this revision was published. */
  publishedAt?: string;
}

export interface PageSeo {
  title: string;
  description: string;
  ogImage?: MediaReference;
  canonicalUrl?: string;
}

/**
 * A section is an instance of a registered component.
 *
 * It references a `componentKey` + `componentVersion` and carries the
 * three data zones: `config`, `style`, and locale-scoped `translations`.
 */
export interface PageSection {
  id: string;
  componentKey: string;
  componentVersion: number;
  /** Variant chosen for this instance. */
  variant?: string;
  /** Functional, non-localized configuration. */
  config: Record<string, unknown>;
  /** Safe style tokens — frontend resolves to actual CSS. */
  style: Record<string, unknown>;
  /** Per-locale content. */
  translations: Partial<Record<Locale, SectionTranslation>>;
}

export interface SectionTranslation {
  /** Whether this translation is published/visible. */
  visible?: boolean;
  /** Localized content payload (shape depends on component). */
  content: Record<string, unknown>;
}
