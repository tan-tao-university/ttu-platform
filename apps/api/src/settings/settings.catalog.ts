import { z } from 'zod';

/**
 * The Settings Registry `apps/api/IMPLEMENTATION_STATUS.md` §5.1 said didn't exist yet — design doc
 * 05 §12.2 only named four example `site_settings` keys with no field-level shape for any of them.
 * Every field below is sourced from what `https://ttu.edu.vn/` (the live WordPress site this
 * platform replaces) actually renders today, not invented: footer phone/email/hours/map, the social
 * icons in the header/footer, the `og:`/`twitter:` meta tags, and the homepage's "EVENTS" widget
 * (shown even with zero upcoming events). `site_settings` has no `locale` column (unlike every
 * content table), so any field that is genuinely different per locale on the live site (org name,
 * postal address, SEO copy) is a locale-keyed record _inside_ one key's JSONB `value`, keyed by
 * `locales.code` rather than a hardcoded `vi`/`en` union - new locales need no schema change here.
 */

const LOCALIZED_TEXT = (max: number) =>
  z.record(z.string().min(1).max(16), z.string().min(1).max(max));

/** Footer contact block + the Google Maps embed next to it. */
const SITE_CONTACT_SCHEMA = z
  .object({
    phone: z.string().min(1).max(50),
    email: z.email(),
    workingHours: z.string().min(1).max(200),
    mapEmbedUrl: z.url().nullable().default(null),
    organizationNameByLocale: LOCALIZED_TEXT(255),
    addressByLocale: LOCALIZED_TEXT(500),
  })
  .strict();

/** Header/footer social icon row. Only platforms the live site still links (no dead Google+). */
const SITE_SOCIAL_LINKS_SCHEMA = z
  .object({
    facebook: z.url().nullable().default(null),
    instagram: z.url().nullable().default(null),
    twitter: z.url().nullable().default(null),
    youtube: z.url().nullable().default(null),
    linkedin: z.url().nullable().default(null),
  })
  .strict();

/** Fallback `<title>`/meta description/OG image for a page/content item with none of its own. */
const SEO_DEFAULTS_SCHEMA = z
  .object({
    defaultTitleByLocale: LOCALIZED_TEXT(500),
    defaultDescriptionByLocale: LOCALIZED_TEXT(1000),
    defaultOgImageId: z.uuid().nullable().default(null),
  })
  .strict();

/**
 * Public feature toggles. Deliberately minimal - only what the live site actually exposes today
 * (the "EVENTS" homepage widget, rendered even with zero events) plus the one universal toggle
 * every site needs regardless of source (`maintenanceMode`). Not a place to pre-invent every
 * conceivable future flag.
 */
const FEATURES_PUBLIC_SCHEMA = z
  .object({
    showEventsWidget: z.boolean().default(true),
    maintenanceMode: z.boolean().default(false),
  })
  .strict();

export interface SettingsCatalogEntry {
  schema: z.ZodType<unknown>;
  description: string;
}

export const SETTINGS_CATALOG: Record<string, SettingsCatalogEntry> = {
  'site.contact': {
    schema: SITE_CONTACT_SCHEMA,
    description: 'Footer contact block (phone, email, hours, map) and per-locale org name/address.',
  },
  'site.social_links': {
    schema: SITE_SOCIAL_LINKS_SCHEMA,
    description: 'Header/footer social profile URLs.',
  },
  'seo.defaults': {
    schema: SEO_DEFAULTS_SCHEMA,
    description: 'Per-locale fallback title/description and default Open Graph image.',
  },
  'features.public': {
    schema: FEATURES_PUBLIC_SCHEMA,
    description: 'Public-facing feature toggles.',
  },
} as const;
