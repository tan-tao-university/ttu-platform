import { relations, sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  char,
  check,
  foreignKey,
  index,
  inet,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

/**
 * TTU Main — physical schema for `ttu_main`, the CMS/business database behind the public website.
 * Mirrors design docs 04 (ERD) and 05 (Database Schema) in the project's Notion workspace. Domain
 * boundaries are enforced by module ownership in application code, living in `public` schema for v1
 * (05 §1).
 *
 * Conventions (05 §1–2):
 *
 * - UUID primary keys via `gen_random_uuid()`.
 * - `timestamptz` for business timestamps.
 * - Status/enum columns use varchar + `$type<...>()` with a CHECK constraint.
 * - Translatable entities use `entity` + `entity_translations` with composite PK `(entity_id,
 *   locale)`.
 */

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
};

/** 1. Locales — source of truth for all translation tables (05 §3). */

export const locales = pgTable(
  'locales',
  {
    code: varchar('code', { length: 16 }).primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    nativeName: varchar('native_name', { length: 100 }).notNull(),
    isDefault: boolean('is_default').notNull().default(false),
    isActive: boolean('is_active').notNull().default(true),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (t) => [
    uniqueIndex('uq_locales_default')
      .on(t.isDefault)
      .where(sql`${t.isDefault} = true`),
    check('locales_sort_order_check', sql`${t.sortOrder} >= 0`),
  ],
);

export type Locale = typeof locales.$inferSelect;
export type NewLocale = typeof locales.$inferInsert;

/**
 * 2. Access — CMS authorization. Authentication lives in TTU Identity/Keycloak; `users` maps Keycloak
 *    subjects to CMS roles (05 §4).
 */

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  identitySubject: varchar('identity_subject', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 320 }),
  displayName: varchar('display_name', { length: 255 }),
  isActive: boolean('is_active').notNull().default(true),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
  ...timestamps,
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 150 }).notNull(),
  description: text('description'),
  isSystem: boolean('is_system').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  ...timestamps,
});

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;

export const permissions = pgTable('permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 150 }).notNull().unique(),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  ...timestamps,
});

export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;

export const rolePermissions = pgTable(
  'role_permissions',
  {
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    permissionId: uuid('permission_id')
      .notNull()
      .references(() => permissions.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.roleId, t.permissionId] })],
);

export type RolePermission = typeof rolePermissions.$inferSelect;
export type NewRolePermission = typeof rolePermissions.$inferInsert;

export const userRoleAssignments = pgTable(
  'user_role_assignments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'restrict' }),
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
  },
  (t) => [uniqueIndex('uq_user_role_assignment').on(t.userId, t.roleId)],
);

export type UserRoleAssignment = typeof userRoleAssignments.$inferSelect;
export type NewUserRoleAssignment = typeof userRoleAssignments.$inferInsert;

/** 3. Media — Postgres holds MinIO object metadata and references, never binary data (05 §5). */

export const mediaAssets = pgTable(
  'media_assets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    bucket: varchar('bucket', { length: 100 }).notNull(),
    storageKey: text('storage_key').notNull(),
    originalFileName: text('original_file_name').notNull(),
    mimeType: varchar('mime_type', { length: 150 }).notNull(),
    fileSize: bigint('file_size', { mode: 'number' }).notNull(),
    width: integer('width'),
    height: integer('height'),
    checksumSha256: char('checksum_sha256', { length: 64 }),
    uploadedBy: uuid('uploaded_by').references(() => users.id, { onDelete: 'set null' }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('uq_media_assets_bucket_storage_key').on(t.bucket, t.storageKey),
    check('media_assets_file_size_check', sql`${t.fileSize} > 0`),
    check('media_assets_width_check', sql`${t.width} IS NULL OR ${t.width} > 0`),
    check('media_assets_height_check', sql`${t.height} IS NULL OR ${t.height} > 0`),
  ],
);

export type MediaAsset = typeof mediaAssets.$inferSelect;
export type NewMediaAsset = typeof mediaAssets.$inferInsert;

export const mediaTranslations = pgTable(
  'media_translations',
  {
    mediaId: uuid('media_id')
      .notNull()
      .references(() => mediaAssets.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 16 })
      .notNull()
      .references(() => locales.code, { onDelete: 'restrict' }),
    altText: varchar('alt_text', { length: 500 }),
    caption: text('caption'),
  },
  (t) => [primaryKey({ columns: [t.mediaId, t.locale] })],
);

export type MediaTranslation = typeof mediaTranslations.$inferSelect;
export type NewMediaTranslation = typeof mediaTranslations.$inferInsert;

/**
 * 4. Programs — university-wide academic programs and degrees (05 §2). Faculty-specific data lives in
 *    TTU Faculty Platform's own database.
 */

export const PROGRAM_STATUSES = ['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'] as const;
export type ProgramStatus = (typeof PROGRAM_STATUSES)[number];

export const programs = pgTable(
  'programs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    code: varchar('code', { length: 64 }).unique(),
    degreeLevel: varchar('degree_level', { length: 30 }),
    status: varchar('status', { length: 20 }).notNull().default('ACTIVE').$type<ProgramStatus>(),
    sortOrder: integer('sort_order').notNull().default(0),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    index('idx_programs_status_sort')
      .on(t.status, t.sortOrder)
      .where(sql`${t.deletedAt} IS NULL`),
    check('programs_status_check', sql`${t.status} IN ('DRAFT','ACTIVE','INACTIVE','ARCHIVED')`),
  ],
);

export type Program = typeof programs.$inferSelect;
export type NewProgram = typeof programs.$inferInsert;

export const programTranslations = pgTable(
  'program_translations',
  {
    programId: uuid('program_id')
      .notNull()
      .references(() => programs.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 16 })
      .notNull()
      .references(() => locales.code, { onDelete: 'restrict' }),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 200 }).notNull(),
    summary: text('summary'),
    description: jsonb('description'),
  },
  (t) => [primaryKey({ columns: [t.programId, t.locale] })],
);

export type ProgramTranslation = typeof programTranslations.$inferSelect;
export type NewProgramTranslation = typeof programTranslations.$inferInsert;

export const people = pgTable('people', {
  id: uuid('id').primaryKey().defaultRandom(),
  portraitMediaId: uuid('portrait_media_id').references(() => mediaAssets.id, {
    onDelete: 'set null',
  }),
  publicEmail: varchar('public_email', { length: 320 }),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  ...timestamps,
});

export type Person = typeof people.$inferSelect;
export type NewPerson = typeof people.$inferInsert;

export const personTranslations = pgTable(
  'person_translations',
  {
    personId: uuid('person_id')
      .notNull()
      .references(() => people.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 16 })
      .notNull()
      .references(() => locales.code, { onDelete: 'restrict' }),
    displayName: varchar('display_name', { length: 255 }).notNull(),
    positionTitle: varchar('position_title', { length: 255 }),
    slug: varchar('slug', { length: 200 }),
    biography: jsonb('biography'),
  },
  (t) => [primaryKey({ columns: [t.personId, t.locale] })],
);
export type PersonTranslation = typeof personTranslations.$inferSelect;
export type NewPersonTranslation = typeof personTranslations.$inferInsert;

export const partners = pgTable('partners', {
  id: uuid('id').primaryKey().defaultRandom(),
  logoMediaId: uuid('logo_media_id').references(() => mediaAssets.id, { onDelete: 'set null' }),
  websiteUrl: text('website_url'),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  ...timestamps,
});

export type Partner = typeof partners.$inferSelect;
export type NewPartner = typeof partners.$inferInsert;

export const partnerTranslations = pgTable(
  'partner_translations',
  {
    partnerId: uuid('partner_id')
      .notNull()
      .references(() => partners.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 16 })
      .notNull()
      .references(() => locales.code, { onDelete: 'restrict' }),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
  },
  (t) => [primaryKey({ columns: [t.partnerId, t.locale] })],
);

export type PartnerTranslation = typeof partnerTranslations.$inferSelect;
export type NewPartnerTranslation = typeof partnerTranslations.$inferInsert;

/**
 * 5. CMS Page Builder — draft/editor state. The public site reads `public_routes` and the published
 *    revision snapshot (05 §7, §11; 06 §9–11).
 */

export const PAGE_TYPES = ['HOMEPAGE', 'STANDARD', 'LANDING', 'SYSTEM'] as const;
export type PageType = (typeof PAGE_TYPES)[number];

export const EDITORIAL_STATUSES = [
  'DRAFT',
  'IN_REVIEW',
  'APPROVED',
  'SCHEDULED',
  'PUBLISHED',
  'ARCHIVED',
] as const;
export type EditorialStatus = (typeof EDITORIAL_STATUSES)[number];

export const pages = pgTable(
  'pages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    pageType: varchar('page_type', { length: 30 }).notNull().$type<PageType>(),
    lockVersion: integer('lock_version').notNull().default(0),
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    updatedBy: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    check(
      'pages_page_type_check',
      sql`${t.pageType} IN ('HOMEPAGE','STANDARD','LANDING','SYSTEM')`,
    ),
  ],
);

export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;

export const pageRevisions = pgTable(
  'page_revisions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    pageId: uuid('page_id')
      .notNull()
      .references(() => pages.id, { onDelete: 'restrict' }),
    locale: varchar('locale', { length: 16 })
      .notNull()
      .references(() => locales.code, { onDelete: 'restrict' }),
    versionNumber: integer('version_number').notNull(),
    schemaVersion: integer('schema_version').notNull().default(1),
    snapshot: jsonb('snapshot').notNull(),
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    publishNote: text('publish_note'),
  },
  (t) => [
    unique('uq_page_revisions_page_locale_version').on(t.pageId, t.locale, t.versionNumber),
    // Composite-FK target for `page_translations.published_revision_id` below — proves a
    // revision row belongs to the exact (page, locale) the pointer claims (05 §7.5). Must be
    // a real UNIQUE CONSTRAINT, not a unique index: Postgres rejects a composite
    // `FOREIGN KEY` targeting an index alone.
    unique('uq_page_revisions_id_page_locale').on(t.id, t.pageId, t.locale),
    index('idx_page_revisions_entity_locale_version').on(
      t.pageId,
      t.locale,
      t.versionNumber.desc(),
    ),
    check('page_revisions_version_number_check', sql`${t.versionNumber} > 0`),
    check('page_revisions_schema_version_check', sql`${t.schemaVersion} > 0`),
    check('page_revisions_snapshot_object_check', sql`jsonb_typeof(${t.snapshot}) = 'object'`),
  ],
);

export type PageRevision = typeof pageRevisions.$inferSelect;
export type NewPageRevision = typeof pageRevisions.$inferInsert;

// Composite FK guarantees a locale's published pointer can never resolve to another
// locale's revision (05 §7.5).
export const pageTranslations = pgTable(
  'page_translations',
  {
    pageId: uuid('page_id')
      .notNull()
      .references(() => pages.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 16 })
      .notNull()
      .references(() => locales.code, { onDelete: 'restrict' }),
    slug: varchar('slug', { length: 200 }).notNull(),
    path: text('path').notNull(),
    title: varchar('title', { length: 500 }).notNull(),
    seoTitle: varchar('seo_title', { length: 500 }),
    seoDescription: varchar('seo_description', { length: 1000 }),
    ogTitle: varchar('og_title', { length: 500 }),
    ogDescription: varchar('og_description', { length: 1000 }),
    ogImageId: uuid('og_image_id').references(() => mediaAssets.id, { onDelete: 'set null' }),
    canonicalUrl: text('canonical_url'),
    robotsIndex: boolean('robots_index').notNull().default(true),
    robotsFollow: boolean('robots_follow').notNull().default(true),
    status: varchar('status', { length: 20 }).notNull().default('DRAFT').$type<EditorialStatus>(),
    publishedRevisionId: uuid('published_revision_id'),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    primaryKey({ columns: [t.pageId, t.locale] }),
    foreignKey({
      name: 'fk_page_translation_published_revision',
      columns: [t.publishedRevisionId, t.pageId, t.locale],
      foreignColumns: [pageRevisions.id, pageRevisions.pageId, pageRevisions.locale],
    }).onDelete('restrict'),
    index('idx_page_translations_status')
      .on(t.locale, t.status)
      .where(sql`${t.status} <> 'ARCHIVED'`),
    index('idx_page_translation_scheduler')
      .on(t.scheduledAt)
      .where(sql`${t.status} = 'SCHEDULED'`),
    check(
      'page_translations_status_check',
      sql`${t.status} IN ('DRAFT','IN_REVIEW','APPROVED','SCHEDULED','PUBLISHED','ARCHIVED')`,
    ),
  ],
);

export type PageTranslation = typeof pageTranslations.$inferSelect;
export type NewPageTranslation = typeof pageTranslations.$inferInsert;

export const pageSections = pgTable(
  'page_sections',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    pageId: uuid('page_id')
      .notNull()
      .references(() => pages.id, { onDelete: 'cascade' }),
    componentKey: varchar('component_key', { length: 150 }).notNull(),
    componentVersion: integer('component_version').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    isVisible: boolean('is_visible').notNull().default(true),
    config: jsonb('config').notNull().default({}),
    style: jsonb('style').notNull().default({}),
    ...timestamps,
  },
  (t) => [
    index('idx_page_sections_page_order').on(t.pageId, t.sortOrder),
    check('page_sections_component_version_check', sql`${t.componentVersion} > 0`),
    check('page_sections_sort_order_check', sql`${t.sortOrder} >= 0`),
    check('page_sections_config_object_check', sql`jsonb_typeof(${t.config}) = 'object'`),
    check('page_sections_style_object_check', sql`jsonb_typeof(${t.style}) = 'object'`),
  ],
);

export type PageSection = typeof pageSections.$inferSelect;
export type NewPageSection = typeof pageSections.$inferInsert;

export const pageSectionTranslations = pgTable(
  'page_section_translations',
  {
    sectionId: uuid('section_id')
      .notNull()
      .references(() => pageSections.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 16 })
      .notNull()
      .references(() => locales.code, { onDelete: 'restrict' }),
    content: jsonb('content').notNull().default({}),
    ...timestamps,
  },
  (t) => [
    primaryKey({ columns: [t.sectionId, t.locale] }),
    check(
      'page_section_translations_content_object_check',
      sql`jsonb_typeof(${t.content}) = 'object'`,
    ),
  ],
);

export type PageSectionTranslation = typeof pageSectionTranslations.$inferSelect;
export type NewPageSectionTranslation = typeof pageSectionTranslations.$inferInsert;

/** 6. Content — articles, news, and events with independent lifecycle from Page Builder (05 §8). */

export const CONTENT_TYPES = [
  'NEWS',
  'ANNOUNCEMENT',
  'PRESS_RELEASE',
  'RESEARCH_ARTICLE',
  'EVENT',
] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export const contents = pgTable(
  'contents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    type: varchar('type', { length: 30 }).notNull().$type<ContentType>(),
    authorUserId: uuid('author_user_id').references(() => users.id, { onDelete: 'set null' }),
    featuredMediaId: uuid('featured_media_id').references(() => mediaAssets.id, {
      onDelete: 'set null',
    }),
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    updatedBy: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    index('idx_contents_type_active')
      .on(t.type)
      .where(sql`${t.deletedAt} IS NULL`),
    check(
      'contents_type_check',
      sql`${t.type} IN ('NEWS','ANNOUNCEMENT','PRESS_RELEASE','RESEARCH_ARTICLE','EVENT')`,
    ),
  ],
);

export type Content = typeof contents.$inferSelect;
export type NewContent = typeof contents.$inferInsert;

export const contentRevisions = pgTable(
  'content_revisions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    contentId: uuid('content_id')
      .notNull()
      .references(() => contents.id, { onDelete: 'restrict' }),
    locale: varchar('locale', { length: 16 })
      .notNull()
      .references(() => locales.code, { onDelete: 'restrict' }),
    versionNumber: integer('version_number').notNull(),
    schemaVersion: integer('schema_version').notNull().default(1),
    snapshot: jsonb('snapshot').notNull(),
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    publishNote: text('publish_note'),
  },
  (t) => [
    unique('uq_content_revisions_content_locale_version').on(
      t.contentId,
      t.locale,
      t.versionNumber,
    ),
    // Composite-FK target for `content_translations.published_revision_id` above. Must be a
    // real UNIQUE CONSTRAINT, not a unique index: Postgres rejects a composite `FOREIGN KEY`
    // targeting an index alone.
    unique('uq_content_revisions_id_content_locale').on(t.id, t.contentId, t.locale),
    index('idx_content_revisions_entity_locale_version').on(
      t.contentId,
      t.locale,
      t.versionNumber.desc(),
    ),
    check('content_revisions_version_number_check', sql`${t.versionNumber} > 0`),
    check('content_revisions_schema_version_check', sql`${t.schemaVersion} > 0`),
    check('content_revisions_snapshot_object_check', sql`jsonb_typeof(${t.snapshot}) = 'object'`),
  ],
);

export type ContentRevision = typeof contentRevisions.$inferSelect;
export type NewContentRevision = typeof contentRevisions.$inferInsert;

// Composite FK guarantees a locale's published pointer can never resolve to another
// locale's revision (05 §8.4).
export const contentTranslations = pgTable(
  'content_translations',
  {
    contentId: uuid('content_id')
      .notNull()
      .references(() => contents.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 16 })
      .notNull()
      .references(() => locales.code, { onDelete: 'restrict' }),
    slug: varchar('slug', { length: 200 }).notNull(),
    path: text('path').notNull(),
    title: varchar('title', { length: 500 }).notNull(),
    excerpt: text('excerpt'),
    body: jsonb('body').notNull(),
    bodyFormat: varchar('body_format', { length: 32 }).notNull().default('rich_text_v1'),
    seoTitle: varchar('seo_title', { length: 500 }),
    seoDescription: varchar('seo_description', { length: 1000 }),
    ogTitle: varchar('og_title', { length: 500 }),
    ogDescription: varchar('og_description', { length: 1000 }),
    ogImageId: uuid('og_image_id').references(() => mediaAssets.id, { onDelete: 'set null' }),
    canonicalUrl: text('canonical_url'),
    robotsIndex: boolean('robots_index').notNull().default(true),
    robotsFollow: boolean('robots_follow').notNull().default(true),
    status: varchar('status', { length: 20 }).notNull().default('DRAFT').$type<EditorialStatus>(),
    publishedRevisionId: uuid('published_revision_id'),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    primaryKey({ columns: [t.contentId, t.locale] }),
    foreignKey({
      name: 'fk_content_translation_published_revision',
      columns: [t.publishedRevisionId, t.contentId, t.locale],
      foreignColumns: [contentRevisions.id, contentRevisions.contentId, contentRevisions.locale],
    }).onDelete('restrict'),
    index('idx_content_translation_public_feed')
      .on(t.locale, t.publishedAt.desc())
      .where(sql`${t.status} = 'PUBLISHED'`),
    index('idx_content_translation_scheduler')
      .on(t.scheduledAt)
      .where(sql`${t.status} = 'SCHEDULED'`),
    check(
      'content_translations_status_check',
      sql`${t.status} IN ('DRAFT','IN_REVIEW','APPROVED','SCHEDULED','PUBLISHED','ARCHIVED')`,
    ),
  ],
);

export type ContentTranslation = typeof contentTranslations.$inferSelect;
export type NewContentTranslation = typeof contentTranslations.$inferInsert;

export const events = pgTable(
  'events',
  {
    contentId: uuid('content_id')
      .primaryKey()
      .references(() => contents.id, { onDelete: 'cascade' }),
    startAt: timestamp('start_at', { withTimezone: true }).notNull(),
    endAt: timestamp('end_at', { withTimezone: true }),
    timezone: varchar('timezone', { length: 64 }).notNull().default('Asia/Ho_Chi_Minh'),
    locationName: varchar('location_name', { length: 500 }),
    locationUrl: text('location_url'),
    registrationUrl: text('registration_url'),
    isOnline: boolean('is_online').notNull().default(false),
  },
  (t) => [
    index('idx_events_start_at').on(t.startAt),
    check('events_end_at_check', sql`${t.endAt} IS NULL OR ${t.endAt} >= ${t.startAt}`),
  ],
);

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

/** 7. Taxonomy — categories and tags hierarchy (05 §9). */

export const categories = pgTable(
  'categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    parentId: uuid('parent_id'),
    code: varchar('code', { length: 100 }).notNull().unique(),
    sortOrder: integer('sort_order').notNull().default(0),
    isActive: boolean('is_active').notNull().default(true),
    ...timestamps,
  },
  (t) => [
    foreignKey({ columns: [t.parentId], foreignColumns: [t.id] }).onDelete('restrict'),
    index('idx_categories_parent_order').on(t.parentId, t.sortOrder),
    check(
      'categories_parent_not_self_check',
      sql`${t.parentId} IS NULL OR ${t.parentId} <> ${t.id}`,
    ),
  ],
);

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export const categoryTranslations = pgTable(
  'category_translations',
  {
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 16 })
      .notNull()
      .references(() => locales.code, { onDelete: 'restrict' }),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 200 }).notNull(),
    description: text('description'),
  },
  (t) => [
    primaryKey({ columns: [t.categoryId, t.locale] }),
    uniqueIndex('uq_category_translations_locale_slug').on(t.locale, t.slug),
  ],
);

export type CategoryTranslation = typeof categoryTranslations.$inferSelect;
export type NewCategoryTranslation = typeof categoryTranslations.$inferInsert;

export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 100 }).unique(),
  isActive: boolean('is_active').notNull().default(true),
  ...timestamps,
});

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;

export const tagTranslations = pgTable(
  'tag_translations',
  {
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 16 })
      .notNull()
      .references(() => locales.code, { onDelete: 'restrict' }),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 200 }).notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.tagId, t.locale] }),
    uniqueIndex('uq_tag_translations_locale_slug').on(t.locale, t.slug),
  ],
);

export type TagTranslation = typeof tagTranslations.$inferSelect;
export type NewTagTranslation = typeof tagTranslations.$inferInsert;

export const contentCategoryAssignments = pgTable(
  'content_category_assignments',
  {
    contentId: uuid('content_id')
      .notNull()
      .references(() => contents.id, { onDelete: 'cascade' }),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'restrict' }),
    isPrimary: boolean('is_primary').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.contentId, t.categoryId] }),
    uniqueIndex('uq_content_primary_category')
      .on(t.contentId)
      .where(sql`${t.isPrimary} = true`),
    index('idx_content_category_assignments_category').on(t.categoryId, t.contentId),
  ],
);

export type ContentCategoryAssignment = typeof contentCategoryAssignments.$inferSelect;
export type NewContentCategoryAssignment = typeof contentCategoryAssignments.$inferInsert;

export const contentTagAssignments = pgTable(
  'content_tag_assignments',
  {
    contentId: uuid('content_id')
      .notNull()
      .references(() => contents.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.contentId, t.tagId] }),
    index('idx_content_tag_assignments_tag').on(t.tagId, t.contentId),
  ],
);

export type ContentTagAssignment = typeof contentTagAssignments.$inferSelect;
export type NewContentTagAssignment = typeof contentTagAssignments.$inferInsert;

/** 8. Navigation — menus and hierarchical menu items (05 §10). */

export const menus = pgTable('menus', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  isActive: boolean('is_active').notNull().default(true),
  ...timestamps,
});

export type Menu = typeof menus.$inferSelect;
export type NewMenu = typeof menus.$inferInsert;

export const MENU_ITEM_LINK_TYPES = [
  'PAGE',
  'CONTENT',
  'EXTERNAL',
  'CUSTOM_PATH',
  'GROUP',
] as const;
export type MenuItemLinkType = (typeof MENU_ITEM_LINK_TYPES)[number];

export const menuItems = pgTable(
  'menu_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    menuId: uuid('menu_id')
      .notNull()
      .references(() => menus.id, { onDelete: 'cascade' }),
    parentId: uuid('parent_id'),
    linkType: varchar('link_type', { length: 20 }).notNull().$type<MenuItemLinkType>(),
    pageId: uuid('page_id').references(() => pages.id, { onDelete: 'restrict' }),
    contentId: uuid('content_id').references(() => contents.id, { onDelete: 'restrict' }),
    externalUrl: text('external_url'),
    sortOrder: integer('sort_order').notNull().default(0),
    isVisible: boolean('is_visible').notNull().default(true),
    ...timestamps,
  },
  (t) => [
    foreignKey({ columns: [t.parentId], foreignColumns: [t.id] }).onDelete('restrict'),
    index('idx_menu_items_tree').on(t.menuId, t.parentId, t.sortOrder),
    check(
      'menu_items_parent_not_self_check',
      sql`${t.parentId} IS NULL OR ${t.parentId} <> ${t.id}`,
    ),
    check(
      'menu_items_link_type_check',
      sql`(${t.linkType} = 'PAGE' AND ${t.pageId} IS NOT NULL AND ${t.contentId} IS NULL AND ${t.externalUrl} IS NULL)
        OR (${t.linkType} = 'CONTENT' AND ${t.contentId} IS NOT NULL AND ${t.pageId} IS NULL AND ${t.externalUrl} IS NULL)
        OR (${t.linkType} = 'EXTERNAL' AND ${t.externalUrl} IS NOT NULL AND ${t.pageId} IS NULL AND ${t.contentId} IS NULL)
        OR (${t.linkType} IN ('CUSTOM_PATH','GROUP') AND ${t.pageId} IS NULL AND ${t.contentId} IS NULL AND ${t.externalUrl} IS NULL)`,
    ),
  ],
);

export type MenuItem = typeof menuItems.$inferSelect;
export type NewMenuItem = typeof menuItems.$inferInsert;

export const menuItemTranslations = pgTable(
  'menu_item_translations',
  {
    menuItemId: uuid('menu_item_id')
      .notNull()
      .references(() => menuItems.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 16 })
      .notNull()
      .references(() => locales.code, { onDelete: 'restrict' }),
    label: varchar('label', { length: 255 }).notNull(),
    customPath: text('custom_path'),
  },
  (t) => [primaryKey({ columns: [t.menuItemId, t.locale] })],
);

export type MenuItemTranslation = typeof menuItemTranslations.$inferSelect;
export type NewMenuItemTranslation = typeof menuItemTranslations.$inferInsert;

/** 9. Public routes — the published route registry resolving public URLs (05 §11). */

export const PUBLIC_ROUTE_TARGET_TYPES = ['PAGE', 'CONTENT'] as const;
export type PublicRouteTargetType = (typeof PUBLIC_ROUTE_TARGET_TYPES)[number];

export const publicRoutes = pgTable(
  'public_routes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    locale: varchar('locale', { length: 16 })
      .notNull()
      .references(() => locales.code, { onDelete: 'restrict' }),
    path: text('path').notNull(),
    targetType: varchar('target_type', { length: 20 }).notNull().$type<PublicRouteTargetType>(),
    pageId: uuid('page_id').references(() => pages.id, { onDelete: 'cascade' }),
    contentId: uuid('content_id').references(() => contents.id, { onDelete: 'cascade' }),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('uq_public_routes_locale_path').on(t.locale, t.path),
    index('idx_public_routes_page')
      .on(t.pageId)
      .where(sql`${t.pageId} IS NOT NULL`),
    index('idx_public_routes_content')
      .on(t.contentId)
      .where(sql`${t.contentId} IS NOT NULL`),
    check('public_routes_target_type_check', sql`${t.targetType} IN ('PAGE','CONTENT')`),
    check(
      'public_routes_exactly_one_target_check',
      sql`(${t.targetType} = 'PAGE' AND ${t.pageId} IS NOT NULL AND ${t.contentId} IS NULL)
        OR (${t.targetType} = 'CONTENT' AND ${t.contentId} IS NOT NULL AND ${t.pageId} IS NULL)`,
    ),
  ],
);

export type PublicRoute = typeof publicRoutes.$inferSelect;
export type NewPublicRoute = typeof publicRoutes.$inferInsert;

/** 10. System — operational redirects, site settings, and audit logs (05 §12). */

export const redirects = pgTable(
  'redirects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    locale: varchar('locale', { length: 16 }).references(() => locales.code, {
      onDelete: 'restrict',
    }),
    sourcePath: text('source_path').notNull(),
    destinationPath: text('destination_path').notNull(),
    statusCode: smallint('status_code').notNull().default(301),
    isActive: boolean('is_active').notNull().default(true),
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('uq_redirects_active_locale_source')
      .on(t.locale, t.sourcePath)
      .where(sql`${t.isActive} = true AND ${t.locale} IS NOT NULL`),
    uniqueIndex('uq_redirects_active_global_source')
      .on(t.sourcePath)
      .where(sql`${t.isActive} = true AND ${t.locale} IS NULL`),
    check('redirects_status_code_check', sql`${t.statusCode} IN (301,302,307,308)`),
    check('redirects_source_not_destination_check', sql`${t.sourcePath} <> ${t.destinationPath}`),
  ],
);

export type Redirect = typeof redirects.$inferSelect;
export type NewRedirect = typeof redirects.$inferInsert;

export const siteSettings = pgTable('site_settings', {
  key: varchar('key', { length: 150 }).primaryKey(),
  value: jsonb('value').notNull(),
  schemaVersion: integer('schema_version').notNull().default(1),
  updatedBy: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type NewSiteSetting = typeof siteSettings.$inferInsert;

// Append-only and high write volume — the one table that uses a bigint identity instead of
// a UUID, since its rows are never referenced by ID from a public API contract (05 §12.3).
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    actorUserId: uuid('actor_user_id').references(() => users.id, { onDelete: 'set null' }),
    action: varchar('action', { length: 150 }).notNull(),
    entityType: varchar('entity_type', { length: 100 }),
    entityId: uuid('entity_id'),
    requestId: varchar('request_id', { length: 100 }),
    metadata: jsonb('metadata'),
    ipAddress: inet('ip_address'),
    userAgent: text('user_agent'),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('idx_audit_actor_time').on(t.actorUserId, t.occurredAt.desc()),
    index('idx_audit_entity_time').on(t.entityType, t.entityId, t.occurredAt.desc()),
  ],
);

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;

/** Relations — used by Drizzle's relational query API (`db.query.*`). */

export const usersRelations = relations(users, ({ many }) => ({
  roleAssignments: many(userRoleAssignments),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  permissions: many(rolePermissions),
  userAssignments: many(userRoleAssignments),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  roles: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, { fields: [rolePermissions.roleId], references: [roles.id] }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));

export const userRoleAssignmentsRelations = relations(userRoleAssignments, ({ one }) => ({
  user: one(users, { fields: [userRoleAssignments.userId], references: [users.id] }),
  role: one(roles, { fields: [userRoleAssignments.roleId], references: [roles.id] }),
}));

export const mediaAssetsRelations = relations(mediaAssets, ({ many }) => ({
  translations: many(mediaTranslations),
}));

export const mediaTranslationsRelations = relations(mediaTranslations, ({ one }) => ({
  media: one(mediaAssets, { fields: [mediaTranslations.mediaId], references: [mediaAssets.id] }),
  locale: one(locales, { fields: [mediaTranslations.locale], references: [locales.code] }),
}));

export const programsRelations = relations(programs, ({ many }) => ({
  translations: many(programTranslations),
}));

export const programTranslationsRelations = relations(programTranslations, ({ one }) => ({
  program: one(programs, {
    fields: [programTranslations.programId],
    references: [programs.id],
  }),
  locale: one(locales, {
    fields: [programTranslations.locale],
    references: [locales.code],
  }),
}));

export const peopleRelations = relations(people, ({ one, many }) => ({
  portrait: one(mediaAssets, { fields: [people.portraitMediaId], references: [mediaAssets.id] }),
  translations: many(personTranslations),
}));

export const personTranslationsRelations = relations(personTranslations, ({ one }) => ({
  person: one(people, { fields: [personTranslations.personId], references: [people.id] }),
  locale: one(locales, { fields: [personTranslations.locale], references: [locales.code] }),
}));

export const partnersRelations = relations(partners, ({ one, many }) => ({
  logo: one(mediaAssets, { fields: [partners.logoMediaId], references: [mediaAssets.id] }),
  translations: many(partnerTranslations),
}));

export const partnerTranslationsRelations = relations(partnerTranslations, ({ one }) => ({
  partner: one(partners, { fields: [partnerTranslations.partnerId], references: [partners.id] }),
  locale: one(locales, { fields: [partnerTranslations.locale], references: [locales.code] }),
}));

export const pagesRelations = relations(pages, ({ many }) => ({
  translations: many(pageTranslations),
  sections: many(pageSections),
  revisions: many(pageRevisions),
}));

export const pageTranslationsRelations = relations(pageTranslations, ({ one }) => ({
  page: one(pages, { fields: [pageTranslations.pageId], references: [pages.id] }),
  locale: one(locales, { fields: [pageTranslations.locale], references: [locales.code] }),
}));

export const pageSectionsRelations = relations(pageSections, ({ one, many }) => ({
  page: one(pages, { fields: [pageSections.pageId], references: [pages.id] }),
  translations: many(pageSectionTranslations),
}));

export const pageSectionTranslationsRelations = relations(pageSectionTranslations, ({ one }) => ({
  section: one(pageSections, {
    fields: [pageSectionTranslations.sectionId],
    references: [pageSections.id],
  }),
  locale: one(locales, { fields: [pageSectionTranslations.locale], references: [locales.code] }),
}));

export const pageRevisionsRelations = relations(pageRevisions, ({ one }) => ({
  page: one(pages, { fields: [pageRevisions.pageId], references: [pages.id] }),
  locale: one(locales, { fields: [pageRevisions.locale], references: [locales.code] }),
}));

export const contentsRelations = relations(contents, ({ one, many }) => ({
  featuredMedia: one(mediaAssets, {
    fields: [contents.featuredMediaId],
    references: [mediaAssets.id],
  }),
  translations: many(contentTranslations),
  revisions: many(contentRevisions),
  event: one(events, { fields: [contents.id], references: [events.contentId] }),
  categoryAssignments: many(contentCategoryAssignments),
  tagAssignments: many(contentTagAssignments),
}));

export const contentTranslationsRelations = relations(contentTranslations, ({ one }) => ({
  content: one(contents, {
    fields: [contentTranslations.contentId],
    references: [contents.id],
  }),
  locale: one(locales, { fields: [contentTranslations.locale], references: [locales.code] }),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  content: one(contents, { fields: [events.contentId], references: [contents.id] }),
}));

export const contentRevisionsRelations = relations(contentRevisions, ({ one }) => ({
  content: one(contents, {
    fields: [contentRevisions.contentId],
    references: [contents.id],
  }),
  locale: one(locales, { fields: [contentRevisions.locale], references: [locales.code] }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, { fields: [categories.parentId], references: [categories.id] }),
  translations: many(categoryTranslations),
  contentAssignments: many(contentCategoryAssignments),
}));

export const categoryTranslationsRelations = relations(categoryTranslations, ({ one }) => ({
  category: one(categories, {
    fields: [categoryTranslations.categoryId],
    references: [categories.id],
  }),
  locale: one(locales, { fields: [categoryTranslations.locale], references: [locales.code] }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  translations: many(tagTranslations),
  contentAssignments: many(contentTagAssignments),
}));

export const tagTranslationsRelations = relations(tagTranslations, ({ one }) => ({
  tag: one(tags, { fields: [tagTranslations.tagId], references: [tags.id] }),
  locale: one(locales, { fields: [tagTranslations.locale], references: [locales.code] }),
}));

export const contentCategoryAssignmentsRelations = relations(
  contentCategoryAssignments,
  ({ one }) => ({
    content: one(contents, {
      fields: [contentCategoryAssignments.contentId],
      references: [contents.id],
    }),
    category: one(categories, {
      fields: [contentCategoryAssignments.categoryId],
      references: [categories.id],
    }),
  }),
);

export const contentTagAssignmentsRelations = relations(contentTagAssignments, ({ one }) => ({
  content: one(contents, {
    fields: [contentTagAssignments.contentId],
    references: [contents.id],
  }),
  tag: one(tags, { fields: [contentTagAssignments.tagId], references: [tags.id] }),
}));

export const menusRelations = relations(menus, ({ many }) => ({
  items: many(menuItems),
}));

export const menuItemsRelations = relations(menuItems, ({ one, many }) => ({
  menu: one(menus, { fields: [menuItems.menuId], references: [menus.id] }),
  parent: one(menuItems, { fields: [menuItems.parentId], references: [menuItems.id] }),
  page: one(pages, { fields: [menuItems.pageId], references: [pages.id] }),
  content: one(contents, { fields: [menuItems.contentId], references: [contents.id] }),
  translations: many(menuItemTranslations),
}));

export const menuItemTranslationsRelations = relations(menuItemTranslations, ({ one }) => ({
  menuItem: one(menuItems, {
    fields: [menuItemTranslations.menuItemId],
    references: [menuItems.id],
  }),
  locale: one(locales, { fields: [menuItemTranslations.locale], references: [locales.code] }),
}));

export const publicRoutesRelations = relations(publicRoutes, ({ one }) => ({
  locale: one(locales, { fields: [publicRoutes.locale], references: [locales.code] }),
  page: one(pages, { fields: [publicRoutes.pageId], references: [pages.id] }),
  content: one(contents, { fields: [publicRoutes.contentId], references: [contents.id] }),
}));
