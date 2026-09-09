# Database: Entity Relationship Diagram (ERD)

## 1. Complete Logical ERD

The database backing TTU Platform (`ttu_main`) consists of **36 physical tables** grouped into 8 cohesive business domains.

![Database ERD Overview](../assets/database-erd-overview.png)

## 2. Table Inventory by Domain

### 2.1 CMS Page Builder (5 tables)

- `pages`: Root page identity and shared draft metadata.
- `page_translations`: Localized slug, title, SEO metadata, status (`DRAFT`, `PUBLISHED`), and published revision pointer.
- `page_sections`: Ordered component instances referencing `component_key` and version with `config` and `style` JSONB.
- `page_section_translations`: Localized content JSONB per component instance.
- `page_revisions`: Immutable historical page snapshots captured at publication.

### 2.2 Editorial Content (4 tables)

- `contents`: Root editorial item identity (`NEWS`, `ANNOUNCEMENT`, `PRESS_RELEASE`, `RESEARCH_ARTICLE`, `EVENT`).
- `content_translations`: Localized title, slug, excerpt, body, and status per locale.
- `content_revisions`: Immutable historical editorial snapshots.
- `events`: Extension table storing event dates, timezone, venue, registration URL, and online flags.

### 2.3 Taxonomy (6 tables)

- `categories`: Self-referencing hierarchical category tree.
- `category_translations`: Localized category names, slugs, and descriptions.
- `tags`: Flat taxonomy tags.
- `tag_translations`: Localized tag names and slugs.
- `content_category_assignments`: Junction linking contents to categories.
- `content_tag_assignments`: Junction linking contents to tags.

### 2.4 University Data (6 tables)

- `programs`: School-wide degree programs with degree levels (`UNDERGRADUATE`, `GRADUATE`, `DOCTORATE`).
- `program_translations`: Localized degree name, slug, summary, and curricula description.
- `people`: University leadership, notable faculty, and board profiles.
- `person_translations`: Localized position titles, biographies, and academic honors.
- `partners`: Academic and healthcare partner institutions with website URLs.
- `partner_translations`: Localized partner descriptions.

### 2.5 Media Assets (2 tables)

- `media_assets`: Metadata for MinIO objects (bucket, key, filename, mime type, size, dimensions, sha256).
- `media_translations`: Localized alt text and captions.

### 2.6 Navigation (3 tables)

- `menus`: Named navigation containers (`main-header`, `footer`, `quick-links`).
- `menu_items`: Hierarchical tree of navigation links.
- `menu_item_translations`: Localized navigation labels and path overrides.

### 2.7 Access Control (5 tables)

- `users`: Local identity mapping Keycloak `sub` to internal user records.
- `roles`: Named system roles (`super_admin`, `cms_admin`, `editor`, `reviewer`, `publisher`).
- `permissions`: Granular permission catalog codes.
- `user_role_assignments`: Grants roles to users with optional expiration timestamps.
- `role_permissions`: Assigns permissions to roles.

### 2.8 System & Routing (5 tables)

- `locales`: Supported system locales (`vi`, `en`).
- `public_routes`: Authoritative published URL routing registry preventing slug collisions.
- `redirects`: URL redirection engine supporting permanent (301) and temporary (302) redirects.
- `site_settings`: Global operational configuration and contact information.
- `audit_logs`: Detailed administrative action trails with request IDs and metadata snapshots.
