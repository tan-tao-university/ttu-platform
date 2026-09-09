# Changelog

Major, project-wide changes to `ttu-platform` — new domains, schema changes, new app surfaces, breaking API changes. Not a line-by-line commit log (git is the source of truth for that); this is the human-readable summary someone catching up on the project should read first. See [`apps/api/IMPLEMENTATION_STATUS.md`](apps/api/IMPLEMENTATION_STATUS.md) for the current state of the backend build-out.

Entries are newest first, grouped by date. Each entry links the PR that shipped it.

## 2026-09-09 — Admin dashboard: browser-side OIDC sign-in ([#17](https://github.com/tan-tao-university/ttu-platform/pull/17))

### Added

- `apps/admin/src/lib/auth/` — server-side (BFF) Authorization Code + PKCE flow against `ttu-identity`'s `ttu` realm, client `ttu-web`: PKCE/state/nonce generation (`pkce.ts`), Keycloak protocol calls and ID-token verification via `jose` (`keycloak.ts`), and AES-256-GCM-encrypted `HttpOnly` session/transaction cookies (`session.ts`).
- `apps/admin/src/app/api/auth/{login,callback,logout}/route.ts` — starts the flow, completes it (validates `state`/`nonce`, exchanges the code, verifies the ID token, sets the session cookie), and clears the local session on logout.
- `apps/admin/src/proxy.ts` (Next.js 16's `middleware.ts` successor) — gates every admin page; transparently refreshes an about-to-expire access token and rewrites the cookie; redirects an unrecoverable session to login.
- `apps/admin/src/lib/api/admin-me.ts` — server-side `GET /api/v1/admin/me` call; `app/page.tsx` and `components/AdminHeader.tsx` render the authenticated identity and permission list.
- `apps/admin/.env.example` — `KEYCLOAK_ISSUER_URL`, `KEYCLOAK_CLIENT_ID`, `APP_BASE_URL`, `SESSION_SECRET`.
- `docs/identity/authentication.md`, `docs/setup.md` — the implemented flow and local setup steps documented.

Verified end to end with a live browser against the real `ttu-identity` Keycloak dev instance and the real `apps/api` dev server: full login redirect, real Keycloak login form submission, callback, session cookie confirmed genuinely `HttpOnly` (`document.cookie` returns empty in the browser), `/admin/me` permission list rendered, and logout confirmed to clear the local session.

### Fixed

- `apps/api/IMPLEMENTATION_STATUS.md`'s top-level status table still listed Media/MinIO (`#16`) as "Not started" after that PR merged — the detailed §3.6 write-up was correct but the summary table row was missed. Corrected alongside this change.
- `docs/setup.md`'s Identity & Authorization section said the 4 non-`super_admin` roles were "seeded with zero grants" — stale since `#15`. Updated to point at the actual grant matrix.

## 2026-09-09 — Media domain: MinIO storage integration ([#16](https://github.com/tan-tao-university/ttu-platform/pull/16))

### Added

- `apps/api/src/media/` — upload (`POST /api/v1/admin/media`, multipart), list/get, alt-text/caption translations, soft-delete with delete-reference protection (published content's `featured_media_id`/`og_image_id`, active `people`/`partners` profiles), and restore.
- `apps/api/src/media/services/storage.service.ts` — S3-compatible MinIO client wrapper (`@aws-sdk/client-s3`) against `ttu-data-infra`'s `ttu-media` bucket (anonymous-download policy, scoped `app-readwrite` credential); plain unsigned delivery URLs, not presigned — verified directly against the running dev MinIO container before merge.
- `apps/api/src/media/services/media-upload.service.ts` — MIME allowlist, per-type size limits, magic-byte signature validation, server-generated storage keys, `image-size`-based dimension extraction, SHA-256 checksum, and best-effort orphan-object cleanup if the metadata insert fails after a successful object write.
- `apps/api/src/config/storage.ts` — `S3_ENDPOINT`/`S3_REGION`/`S3_BUCKET`/`S3_ACCESS_KEY`/`S3_SECRET_KEY`/`S3_PUBLIC_URL_BASE` configuration.
- `apps/api/test/media/` — signature/allowlist/size-limit unit tests against real magic bytes and a real PNG fixture, plus the orphan-cleanup-on-failed-insert path.
- `docs/media/storage-and-pipeline.md`, `docs/api/endpoints.md`, `docs/setup.md` — Media domain API, permissions, and delivery model documented.

## 2026-09-09 — Role → permission grants for cms_admin, editor, reviewer, publisher ([#15](https://github.com/tan-tao-university/ttu-platform/pull/15))

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
