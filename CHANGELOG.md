# Changelog

Major, project-wide changes to `ttu-platform` — new domains, schema changes, new app
surfaces, breaking API changes. Not a line-by-line commit log (git is the source of truth for
that); this is the human-readable summary someone catching up on the project should read
first. See [`apps/api/IMPLEMENTATION_STATUS.md`](apps/api/IMPLEMENTATION_STATUS.md) for the
current state of the backend build-out.

Entries are newest first, grouped by date. Each entry links the PR that shipped it.

## 2026-09-09

### Added

- `apps/api/IMPLEMENTATION_STATUS.md` — living backend implementation tracker (moved from the
  repo root into `apps/api/`, since it tracks `apps/api` specifically).
- This changelog and the process rule (see `AGENTS.md`/`CLAUDE.md`) requiring both files to be
  updated alongside any major change.

## 2026-09-08 — Content domain and taxonomy ([#11](https://github.com/tan-tao-university/ttu-platform/pull/11))

### Added

- `apps/api/src/content/` — news, announcements, press releases, research articles, and
  events, with per-locale draft → publish → immutable revision → rollback, `public_routes`
  sync, and an auto-generated redirect when a published path changes.
- `apps/api/src/taxonomy/` — categories (self-referencing hierarchy) and tags, full CRUD with
  per-locale translations.
- `apps/api/src/common/http/` — a ProblemDetails-style error envelope (design doc 06 §15) and
  a `ValidationPipe` `exceptionFactory` producing field-level `errors[]`.
- `apps/api/src/common/db/postgres-error.util.ts` — unique/foreign-key violation detection.

### Fixed

- Public API reads were sourcing display fields from live `content_translations` columns —
  editing a draft after publish leaked into the public API immediately. Public reads now
  source exclusively from the published revision's immutable snapshot.
- `restore()` resetting a translation's `status` back to `DRAFT` was silently un-publishing
  the still-live revision, because public queries filtered on `status = 'PUBLISHED'`.
  Visibility is now gated solely by `published_revision_id` being set; `status` is an
  editorial-workflow indicator only.
- `drizzle-orm`'s postgres-js session wraps the real Postgres driver error (the one carrying
  the SQLSTATE `.code`) as `.cause` — constraint-violation detection was checking the wrong
  object, so every conflict surfaced as a 500 instead of 409/422.

## 2026-09-08 — Identity, authorization, and Keycloak wiring ([#10](https://github.com/tan-tao-university/ttu-platform/pull/10))

### Added

- `apps/api/src/access/` — `JwtAuthGuard` verifies `ttu-identity`-issued Keycloak access
  tokens (JWKS, issuer, `azp`); JIT-provisions the local `users` row on first sign-in with no
  default role; `PermissionsGuard` + `@RequirePermission(...)` enforce RBAC from `ttu_main`'s
  own `roles`/`permissions` tables, never from the token.
- `GET /api/v1/admin/me` — the first Admin API route.
- `ttu-web` Keycloak client registered in `ttu-identity`'s realm.
- `db:seed` (permission catalog + 5 named roles — only `super_admin` granted) and
  `db:create-super-admin` (bootstrap script) in `apps/api`.

## 2026-09-08 — Database schema and Drizzle wiring ([#9](https://github.com/tan-tao-university/ttu-platform/pull/9))

### Added

- `apps/api/src/db/schema.ts` — the full physical schema for `ttu_main` (36 tables: access,
  media, university, CMS page builder, content, taxonomy, navigation, system), matching the
  approved ERD and physical-schema design docs.
- Drizzle ORM wiring (`apps/api/src/db/`, `apps/api/drizzle/`) against `ttu-data-infra`'s
  `ttu_main` Postgres database.
