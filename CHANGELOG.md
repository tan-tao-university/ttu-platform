# Changelog

Major, project-wide changes to `ttu-platform` — new domains, schema changes, new app surfaces, breaking API changes. Not a line-by-line commit log (git is the source of truth for that); this is the human-readable summary someone catching up on the project should read first. See [`apps/api/IMPLEMENTATION_STATUS.md`](apps/api/IMPLEMENTATION_STATUS.md) for the current state of the backend build-out.

Entries are newest first, grouped by date. Each entry links the PR that shipped it.

## 2026-09-09 — Role → permission grants for cms_admin, editor, reviewer, publisher

### Added

- `apps/api/src/db/role-permissions.catalog.ts` — explicit, individually-justified permission grant list for the 4 non-`super_admin` roles (design doc 07 §10, doc 01 §4), replacing the zero-grant placeholder left by PR #10.
- `apps/api/src/db/seed.ts`'s `seedRoleGrants()` — syncs each role's `role_permissions` rows to exactly its catalog list on every seed run (inserts missing grants, revokes stale ones), keeping the seed idempotent.
- `apps/api/test/db/role-permissions.catalog.spec.ts` — asserts the grant matrix invariants: every code exists in the permission catalog, no duplicate grants, no non-`super_admin` role holds a sensitive system-administration permission, and each role's grants match its documented scope.
- `docs/identity/authorization.md` §3 — the resulting role → permission grant matrix, plus a corrected, complete permission catalog table.

## 2026-09-09 — Database schema alignment with updated Notion spec ([#12](https://github.com/tan-tao-university/ttu-platform/pull/12))

### Changed

- Renamed database tables in `apps/api/src/db/schema.ts` to match the canonical 36-table specification from Notion doc 05: `content_items` → `contents`, `academic_programs` → `programs`, `academic_program_translations` → `program_translations`, and `people_translations` → `person_translations`.
- Removed `scheduled_at` and `published_at` columns from `pages` table; scheduling and publishing lifecycle is strictly managed per-locale in `page_translations`.
- Removed unsupported `target` column from `menu_items` table and `notes` column from `redirects`.
- Added partial unique indexes on `redirects`: `uq_redirects_active_locale_source` for active locale-specific redirects and `uq_redirects_active_global_source` for active global redirects.
- Added `request_id` column to `audit_logs`, made `metadata` nullable, and aligned index names to `idx_audit_actor_time` and `idx_audit_entity_time`.
- Added missing indexes: `idx_programs_status_sort` on `programs`, `idx_page_revisions_entity_locale_version` on `page_revisions`, `idx_page_translations_status` and `idx_page_translation_scheduler` on `page_translations`, `idx_page_sections_page_order` on `page_sections`, and `idx_content_revisions_entity_locale_version` on `content_revisions`.
- Set `media_assets.checksum_sha256` data type to fixed `char(64)`, widened `page_sections.component_key` to `varchar(150)`, and added `default(0)` to `sort_order`.
- Updated `apps/api/src/content/` repositories and services to use the canonical `contents` table and `Content` types.
- Generated Drizzle migration `0002_database_schema_alignment.sql` to apply all schema diffs cleanly.

### Added

- `apps/api/IMPLEMENTATION_STATUS.md` — living backend implementation tracker (moved from the repo root into `apps/api/`, since it tracks `apps/api` specifically).
- This changelog and the process rule (see `AGENTS.md`/`CLAUDE.md`) requiring both files to be updated alongside any major change.

## 2026-09-08 — Content domain and taxonomy ([#11](https://github.com/tan-tao-university/ttu-platform/pull/11))

### Added

- `apps/api/src/content/` — news, announcements, press releases, research articles, and events, with per-locale draft → publish → immutable revision → rollback, `public_routes` sync, and an auto-generated redirect when a published path changes.
- `apps/api/src/taxonomy/` — categories (self-referencing hierarchy) and tags, full CRUD with per-locale translations.
- `apps/api/src/common/http/` — a ProblemDetails-style error envelope (design doc 06 §15) and a `ValidationPipe` `exceptionFactory` producing field-level `errors[]`.
- `apps/api/src/common/db/postgres-error.util.ts` — unique/foreign-key violation detection.

### Fixed

- Public API reads were sourcing display fields from live `content_translations` columns — editing a draft after publish leaked into the public API immediately. Public reads now source exclusively from the published revision's immutable snapshot.
- `restore()` resetting a translation's `status` back to `DRAFT` was silently un-publishing the still-live revision, because public queries filtered on `status = 'PUBLISHED'`. Visibility is now gated solely by `published_revision_id` being set; `status` is an editorial-workflow indicator only.
- `drizzle-orm`'s postgres-js session wraps the real Postgres driver error (the one carrying the SQLSTATE `.code`) as `.cause` — constraint-violation detection was checking the wrong object, so every conflict surfaced as a 500 instead of 409/422.

## 2026-09-08 — Identity, authorization, and Keycloak wiring ([#10](https://github.com/tan-tao-university/ttu-platform/pull/10))

### Added

- `apps/api/src/access/` — `JwtAuthGuard` verifies `ttu-identity`-issued Keycloak access tokens (JWKS, issuer, `azp`); JIT-provisions the local `users` row on first sign-in with no default role; `PermissionsGuard` + `@RequirePermission(...)` enforce RBAC from `ttu_main`'s own `roles`/`permissions` tables, never from the token.
- `GET /api/v1/admin/me` — the first Admin API route.
- `ttu-web` Keycloak client registered in `ttu-identity`'s realm.
- `db:seed` (permission catalog + 5 named roles — only `super_admin` granted) and `db:create-super-admin` (bootstrap script) in `apps/api`.

## 2026-09-08 — Database schema and Drizzle wiring ([#9](https://github.com/tan-tao-university/ttu-platform/pull/9))

### Added

- `apps/api/src/db/schema.ts` — the full physical schema for `ttu_main` (36 tables: access, media, university, CMS page builder, content, taxonomy, navigation, system), matching the approved ERD and physical-schema design docs.
- Drizzle ORM wiring (`apps/api/src/db/`, `apps/api/drizzle/`) against `ttu-data-infra`'s `ttu_main` Postgres database.
