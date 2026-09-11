# TTU Platform — Backend Implementation Status

> Living implementation tracker for the `ttu-platform` repository.
>
> Read this file **before modifying `apps/api`** to understand:
>
> - what has already been implemented;
> - what is currently being worked on;
> - what should be implemented next;
> - what is intentionally blocked;
> - what has not yet been scoped.

Setup and verification instructions are documented in [`../../docs/setup.md`](../../docs/setup.md). Repository wiring and implementation-order rules are documented in [`../../AGENTS.md`](../../AGENTS.md). Major project-wide changes are also recorded in [`../../CHANGELOG.md`](../../CHANGELOG.md).

Cross-application trackers:

- [**Master Monorepo Status**](../../IMPLEMENTATION_STATUS.md)
- [**Admin Dashboard Status**](../admin/IMPLEMENTATION_STATUS.md)
- [**Public Website Status**](../web/IMPLEMENTATION_STATUS.md)

---

## 1. Current Status

|   # | Domain                      | Status      | PR / Reference              |
| --: | --------------------------- | ----------- | --------------------------- |
|   1 | Database schema             | ✅ Complete | Design docs                 |
|   2 | Database infrastructure     | ✅ Complete | PR #9                       |
|   3 | Identity & authorization    | ✅ Complete | PR #10                      |
|   4 | Content & taxonomy          | ✅ Complete | PR #11                      |
|   5 | Role → permission grants    | ✅ Complete | PR #15                      |
|   6 | Media / MinIO               | ✅ Complete | PR #16                      |
|   7 | Admin authentication UI     | ✅ Complete | `apps/admin` PR             |
|   8 | CMS Page Builder            | 🟠 Partial  | PR #20; Design docs 02–03   |
|   9 | Navigation                  | ✅ Complete | —                           |
|  10 | Redirect administration     | ✅ Complete | PR #21                      |
|  11 | Site settings               | ✅ Complete | PR #22; Design doc 05 §12.2 |
|  12 | Audit log API               | ✅ Complete | PR #19                      |
|  13 | Public route resolution     | ✅ Complete | PR #23; Design doc 05 §12.1 |
|  14 | Public website integration  | ⚪ Backlog  | —                           |
|  15 | WordPress migration tooling | ⚪ Backlog  | Design doc 09               |
|  16 | Structured logging (Pino)   | ✅ Complete | PR #25; Design doc 06 §16   |

### Status legend

| Status | Meaning |
| --- | --- |
| ✅ Complete | Implemented and merged |
| 🟠 Partial | Implemented for what's currently specified; more is planned but blocked on a missing spec |
| 🟡 Next | Current or immediate implementation priority |
| 🔵 In progress | Actively being implemented |
| ⚪ Not started | Known work but implementation has not started |
| 🔴 Blocked | Must not be implemented until the dependency/specification exists |

---

# 2. Current Priority

Every backend domain in the original priority queue (role → permission grants, media/MinIO, admin authentication UI) plus Navigation, Audit Log API, Redirect Administration, Site Settings, and Public Route Resolution is now complete. The Component Registry (`packages/cms-registry`) is implemented and the CMS Page Builder API (`src/cms/`) is wired end-to-end against it (§3.11) — but only `hero` v1 is registered, so this domain is **Partial**, not Complete: adding the other ~19 named components from design doc 03 §21 each requires their own full field-level contract (doc 03 §22) first, and the Admin Page Editor UI / Web renderer don't exist.

No backend domain is currently prioritized ahead of the others. `apps/api` has nothing left to build speculatively: every public-facing backend domain `apps/web` needs (Content, Pages, Navigation, Settings, and now route resolution) exists. Of the remaining Backlog items (§5): Public Website Integration is `apps/web`'s work, not `apps/api`'s. WordPress Migration Tooling has not yet been scoped, and needs real legacy WordPress data access to execute against. The next concrete step is either:

```text
write a real field-level contract for one more doc 03 §21 component name, or
build the Admin Page Editor UI / Web renderer against the now-existing Page/Section API, or
wire apps/web to the now-complete public-facing backend domains (this is apps/web scope, not apps/api), or
scope WordPress Migration Tooling once real legacy data access exists
```

# 3. Completed

## 3.1 Database Schema

**Status:** ✅ Complete

**Location**

```text
apps/api/src/db/schema.ts
```

### Implemented

The physical schema for `ttu_main` has been implemented.

The schema currently contains **36 tables** covering:

- access control;
- users and roles;
- media;
- university data;
- CMS page builder;
- content;
- taxonomy;
- navigation;
- redirects;
- site settings;
- audit/system data.

The schema matches the approved database design documents (including the 2026-09-09 revision of Notion doc 05):

```text
Design document 04 (ERD)
Design document 05 (Database Schema)
```

All 36 tables strictly follow the official canonical names (`contents`, `content_translations`, `content_revisions`, `events`, `programs`, `program_translations`, `pages`, `page_translations`, `page_sections`, `page_section_translations`, `page_revisions`, `people`, `person_translations`, `partners`, `partner_translations`, `categories`, `category_translations`, `tags`, `tag_translations`, `content_category_assignments`, `content_tag_assignments`, `media_assets`, `media_translations`, `menus`, `menu_items`, `menu_item_translations`, `public_routes`, `users`, `roles`, `permissions`, `role_permissions`, `user_role_assignments`, `locales`, `redirects`, `site_settings`, `audit_logs`), with accurate indexing strategy, partial unique indexes for redirects, and strict types.

### Important note

Some tables exist at the database level even though their application domains have not yet been implemented.

For example:

```text
pages
page_sections
media_assets
media_translations
menus
menu_items
site_settings
audit_logs
```

The presence of a table does **not** mean its API/domain is complete.

---

## 3.2 Database Infrastructure

**Status:** ✅ Complete **PR:** #9

### Implemented

`apps/api` is connected to the PostgreSQL instance managed by:

```text
ttu-data-infra
```

Database:

```text
ttu_main
```

ORM:

```text
Drizzle ORM
```

### Relevant paths

```text
apps/api/src/db/
apps/api/drizzle/
```

### Responsibilities implemented

- PostgreSQL connection;
- Drizzle configuration;
- schema registration;
- migration generation;
- migration execution;
- local development database workflow.

### Infrastructure relationship

```text
ttu-platform
    │
    │ Drizzle ORM
    ▼
ttu_main
    │
    ▼
PostgreSQL
    │
    ▼
ttu-data-infra
```

---

## 3.3 Identity & Authorization

**Status:** ✅ Complete **PR:** #10

### Architecture

Authentication is delegated to:

```text
ttu-identity
```

which runs Keycloak as the central Identity Provider.

`ttu-platform` does **not** store passwords.

Authentication flow:

```text
User
  ↓
Keycloak / ttu-identity
  ↓
Access Token
  ↓
ttu-platform API
  ↓
JwtAuthGuard
  ↓
PermissionsGuard
```

### Implemented

#### JWT authentication

Location:

```text
apps/api/src/access/
```

`JwtAuthGuard` verifies Keycloak-issued access tokens using:

- JWKS;
- issuer validation;
- `azp` validation;
- token signature validation.

---

#### Local user provisioning

When a valid Keycloak identity accesses the API for the first time, the API creates the corresponding local `users` row.

This is JIT provisioning:

```text
Keycloak user
    ↓
first authenticated API request
    ↓
local users record created
```

No default role is automatically assigned.

---

#### Permission-based authorization

Authorization is enforced through:

```text
PermissionsGuard
```

and:

```ts
@RequirePermission(...)
```

Permissions are resolved from `ttu_main` rather than from Keycloak roles.

This keeps:

```text
Authentication → Keycloak

Authorization → ttu_main
```

separate.

---

#### Admin identity endpoint

Implemented:

```http
GET /api/v1/me
```

This endpoint returns the authenticated admin user's local identity and authorization information.

---

#### Permission catalog

The permission catalog is seeded through:

```text
db:seed
```

Roles currently seeded:

```text
super_admin
cms_admin
editor
reviewer
publisher
```

At the moment:

```text
super_admin → permissions assigned
cms_admin   → no grants yet
editor      → no grants yet
reviewer    → no grants yet
publisher   → no grants yet
```

The remaining role grants are intentionally handled as implementation item **#5**.

---

#### Super admin bootstrap

Bootstrap command:

```text
db:create-super-admin
```

Purpose:

```text
Keycloak user
    ↓
local users record
    ↓
super_admin assignment
```

This provides the initial administrative account required to bootstrap the system.

---

## 3.4 Content & Taxonomy

**Status:** ✅ Complete **PR:** #11

### Relevant paths

```text
apps/api/src/content/
apps/api/src/taxonomy/
```

### Supported content types

The content domain currently supports:

```text
news
announcements
press releases
research articles
events
```

---

### Content lifecycle

Each locale follows:

```text
Draft
  ↓
Publish
  ↓
Immutable Revision
  ↓
Future changes
  ↓
New Revision
```

Previous published revisions can be restored through rollback.

---

### Implemented capabilities

#### Admin APIs

Administrative endpoints support:

- create;
- edit;
- publish;
- update;
- revision history;
- rollback / restore.

---

#### Public APIs

Public controllers expose published content to frontend consumers.

Draft content is not exposed through public routes.

---

#### Revision system

Publishing creates immutable revisions.

The revision model allows:

```text
revision 1
revision 2
revision 3
...
```

Existing revisions are not modified after publication.

---

#### Route synchronization

Content publishing synchronizes entries into:

```text
public_routes
```

When a published path changes:

```text
old path
   ↓
redirect
   ↓
new path
```

A redirect is generated automatically.

---

### Taxonomy

Implemented:

```text
categories
tags
category translations
tag translations
```

Categories support hierarchical relationships.

Example:

```text
News
├── University
├── Admissions
└── Research
```

---

### Error response format

Common API error handling is implemented under:

```text
apps/api/src/common/http/
```

The API error envelope follows:

```text
Design document 06 §15
```

---

## 3.5 Role → Permission Grants

**Status:** ✅ Complete **PR:** #15

### What changed

`cms_admin`, `editor`, `reviewer`, and `publisher` previously had zero permission grants; only `super_admin` did. Each of the 4 roles now has an explicit grant list in:

```text
apps/api/src/db/role-permissions.catalog.ts
```

applied by `seedRoleGrants()` in `apps/api/src/db/seed.ts`, which syncs each role's `role_permissions` rows to exactly the documented list (inserts missing grants, revokes anything no longer listed) every time the idempotent seed runs.

### Source of truth

Each grant list is justified inline against design document 07 §10 (role responsibilities) and design document 01 §4 (user personas) — see `docs/identity/authorization.md` §3 for the resulting matrix. `super_admin` is unchanged: it still receives every catalog permission directly.

### Tests

`apps/api/test/db/role-permissions.catalog.spec.ts` asserts the matrix invariants: every granted code exists in the permission catalog, no duplicate grants, no non-`super_admin` role holds a sensitive system-administration permission (`user.read`, `user.manage`, `role.manage`, `audit.read`), and each role's grants match its documented scope (e.g. `reviewer` is read-only, `publisher` has no authoring rights).

---

## 3.6 Media Domain / MinIO

**Status:** ✅ Complete **PR:** #16

### What changed

```text
apps/api/src/media/
```

implements the Media domain end to end against `ttu-data-infra`'s MinIO instance:

- `services/storage.service.ts` — thin S3-compatible client wrapper (put/delete/head object, public delivery URL). Path-style addressing, since MinIO requires it.
- `services/media-upload.service.ts` — orchestrates a single upload: MIME allowlist + size-limit + magic-byte signature validation, server-generated `{category}/{yyyy}/{mm}/{uuid}.{ext}` storage key (never the client filename), image dimension extraction (`image-size`), SHA-256 checksum, then object write + metadata insert with best-effort object cleanup if the metadata insert fails.
- `repositories/media-assets.repository.ts` — CRUD plus `isReferenced()`, which blocks delete only when the asset is reachable from _live_ data: a published content locale's `featured_media_id`/`og_image_id`, or an active `people`/`partners` profile.
- `controllers/media.controller.ts` — `GET/POST /api/v1/media`, `GET /api/v1/media/:id`, `PUT /api/v1/media/:id/translations/:locale`, `DELETE /api/v1/media/:id`, `POST /api/v1/media/:id/restore`. Admin-only — no public read route (see `docs/api/conventions.md` §1).

### Allowlist and limits (design doc 08 §9-11)

`image/jpeg`, `image/png`, `image/webp` (10 MB), `application/pdf` (50 MB). SVG is excluded — no trusted sanitizer in v1 (doc 08 §10).

### Delivery model

`ttu-data-infra` provisions a single public bucket (`ttu-media`, anonymous-download bucket policy — see its `minio/init/create-buckets.sh`) plus a scoped `app-readwrite` credential distinct from the MinIO root user. Delivery is therefore a plain, immutable URL (`{S3_PUBLIC_URL_BASE}/{bucket}/{key}`), not a signed one — verified directly against the running dev MinIO container (put, head, anonymous public GET, delete all confirmed working with the real `ttu-app` credential before this shipped).

### Configuration

```text
S3_ENDPOINT
S3_REGION        (optional, default us-east-1)
S3_BUCKET
S3_ACCESS_KEY
S3_SECRET_KEY
S3_PUBLIC_URL_BASE   (optional, defaults to S3_ENDPOINT)
```

### Tests

`apps/api/test/media/media-type-policy.spec.ts` (signature validation against real magic bytes, SVG exclusion, size caps) and `apps/api/test/media/services/media-upload.service.spec.ts` (allowlist/size/signature rejection, real dimension extraction from a valid PNG fixture, storage-key format, orphan cleanup when the metadata insert fails).

---

## 3.7 Admin Authentication UI

**Status:** ✅ Complete **Reference:** `apps/admin` (see [`apps/admin/IMPLEMENTATION_STATUS.md`](../admin/IMPLEMENTATION_STATUS.md) §3.1)

`apps/api` already validated Keycloak tokens; the missing piece was `apps/admin`'s browser-side login. Implemented as a server-side (BFF) Authorization Code + PKCE flow — `apps/admin/src/lib/auth/`, `apps/admin/src/app/api/auth/`, `apps/admin/src/proxy.ts`:

- Login redirects to Keycloak with `state`/`nonce`/PKCE `code_challenge`; callback validates `state`, exchanges the code, verifies the ID token (signature, issuer, `azp`, `nonce`) via `jose`.
- Session is an AES-256-GCM-encrypted, `HttpOnly`, `SameSite=Lax` cookie — the browser never receives a token in any form its own JS can read (doc 07 §5).
- `proxy.ts` gates every page, transparently refreshing an about-to-expire access token and redirecting an unrecoverable session back to login.
- `GET /api/v1/me` is called server-side with the session's access token on every page load to hydrate identity and the permission list.

Verified with a live browser against the real `ttu-identity` Keycloak dev instance and the real `apps/api` dev server: full login redirect through Keycloak's actual login form, callback, session cookie confirmed genuinely `HttpOnly` (`document.cookie` returns empty), `/me` permission list rendered, and logout confirmed to clear the local session cookie.

---

## 3.8 Navigation

**Status:** ✅ Complete

`apps/api/src/navigation/` implements menus/menu items (doc 01 §12) — `MenusRepository`, `NavigationController` (single merged `menus` resource, RBAC-branched by `navigation.manage` — see §3.9). Full model, link-type rules, and the flat-editor/resolved-delivery-tree split are documented in [`../../docs/architecture/navigation.md`](../../docs/architecture/navigation.md).

`linkType = PAGE` items are structurally supported (schema + validation) but resolve to `href: null` today, same as `public_routes.pageId` always being empty — the CMS Page Builder domain is blocked, so nothing ever publishes a page. `CONTENT`, `EXTERNAL`, `CUSTOM_PATH`, and `GROUP` are fully usable now.

Verified directly against the real dev Postgres (`MenusRepository`, bypassing HTTP): a menu with all 5 link types including a `GROUP`/`CUSTOM_PATH` parent-child pair and a genuinely published `CONTENT` item — hidden-item exclusion, href resolution per type, tree nesting, and inactive-menu → `undefined` all confirmed.

### Tests

`apps/api/test/navigation/menu-item-link.util.spec.ts` — `assertValidLinkTarget`'s discriminated-union enforcement (every valid shape, every missing-required-field case, every wrong-field-set case) and `resolveMenuItemHref`'s per-link-type resolution.

---

## 3.9 RBAC-Merged Content & Navigation Endpoints

**Status:** ✅ Complete

`Content` and `Navigation` no longer split into separate admin-prefixed and public-prefixed controllers. Design doc 06 §5 calls for one resource, one URL, with RBAC deciding depth of access; `ContentController` and `NavigationController` now implement that directly:

- `OptionalJwtAuthGuard` (new, alongside the existing mandatory `JwtAuthGuard`) verifies a Bearer token when present but never rejects a request for lacking one — both guards share the extracted `TokenVerificationService` so there is exactly one JWT-verification code path.
- `PermissionsGuard` now distinguishes `401` (no `request.user` at all — never authenticated) from `403` (authenticated, missing the specific permission) instead of a single undifferentiated rejection.
- `GET /api/v1/content`, `GET /api/v1/content/:id`, and `GET /api/v1/menus/:key` check the caller's permission in application code and branch: `content.read`/`navigation.manage` gets the full editorial resource, anyone else (including an authenticated-but-unprivileged caller) gets the published-only delivery view of the exact same URL. `GET /api/v1/content/by-slug/:locale/:slug` has no privileged variant — draft slugs are not unique, so there is no well-defined admin answer to that lookup.
- Every write route keeps its original `@RequirePermission(...)` and 401/403 behavior unchanged.
- Navigation switched its addressing from `id` to the immutable `key` throughout (`GET/PATCH/DELETE /menus/:key`, `/menus/:key/items...`) — the same identifier the old public-only route already used, now shared by both views.
- `DeliveryContentController`, `DeliveryNavigationController`, `AdminContentListQueryDto`, and `PublicContentListQueryDto` are deleted; `ContentListQueryDto` is the one query shape both branches of `GET /api/v1/content` validate against.

Verified over real HTTP against the dev API and real Postgres, with real Keycloak-issued tokens (`admin.test` granted `super_admin`, `student.test` with no grants): the same `GET /api/v1/content` and `GET /api/v1/menus/:key` URLs return the admin shape for a `content.read`/`navigation.manage` holder and the public delivery shape otherwise; `POST /api/v1/content` 401s anonymously and 403s for an authenticated caller without `content.create`; `GET /api/v1/menus` 401s anonymously and 403s without `navigation.manage`; an unknown menu key 404s. See `docs/api/conventions.md` §1 and `docs/api/endpoints.md` for the resulting contract.

## 3.10 Audit Log API

**Status:** ✅ Complete **PR:** #19

### Relevant paths

```text
apps/api/src/audit/
```

Read-only surface over `audit_logs` (design doc 06 §16), which already receives rows from `content.publish`/`content.restore` (`content-publishing.service.ts`) — this domain adds the query layer, not the writes.

```text
GET /api/v1/audit-logs
```

Newest-first, paginated; optional `actorUserId`/`action`/`entityType`/`entityId`/`occurredFrom`/`occurredTo` filters (`AuditLogListQueryDto`), combined with AND. Gated by `audit.read`, always required — `role-permissions.catalog.ts` withholds it from every role but `super_admin` (doc 07 §10 reserves "sensitive system administration" to it), so there is no unprivileged branch on this controller.

Verified over real HTTP against the dev API and real Postgres, with a real Keycloak-issued `super_admin` token: an anonymous request 401s, an authenticated request with no grants 403s, publishing a real content item produces a real `content.publish` audit row visible in the very next list call, `action=`/`entityType=`+`entityId=` filters return exactly the matching row, and an invalid `entityId` 422s with a field-level error.

## 3.11 CMS Page Builder API & Component Registry

**Status:** 🟠 Partial **PR:** #20, #24

### Relevant paths

```text
packages/cms-registry/
apps/api/src/cms/
```

`packages/cms-registry` implements the registry engine design doc 03 §2-4, 13, 16-20 describes: `ComponentDefinition` (Zod `contentSchema`/`configSchema`/`styleSchema`, defaults, `editorMetadata`, `variants`, `lifecycle`), the Level A safe style-token vocabulary (doc 03 §9), and `registerComponent`/`getComponentDefinition`/`validateSectionStructure`/`validateSectionContent`/`validateSection`. Only `hero` v1 is registered — the one component doc 03 §3 gives a complete, field-by-field spec for. The other ~19 names in doc 03 §21 are category placeholders only; each needs its own full contract (doc 03 §22) before it can be registered — that is real product/design work, not something inferred from a category name.

`apps/api/src/cms/` wires the full Page/Section/Preview/Publish/Rollback API against the existing `pages`/`page_sections`/`page_translations`/`page_revisions`/`page_section_translations` schema, reusing the exact patterns already shipped for Content (§3.4) and Navigation (§3.8, §3.9):

- `PagesController` merges the admin and delivery views into one resource at one URL (design doc 06 §5): `GET /pages`, `GET /pages/:id`, `GET /pages/by-slug/:locale/:slug` branch on `page.read`, exactly like `ContentController`. Every write route requires its permission outright (`page.create`/`page.edit`/`page.delete`/`page.publish`/`page.restore` — already seeded per role).
- `PageSectionsService` validates every `content`/`config`/`style` write against the registry before it reaches the database, and `PagePublishingService.publish()` re-validates the full resolved state of every section at publish time (doc 03 §13: "ưu tiên reject khi publish để phát hiện data drift sớm").
- Section structure (create/update/delete/reorder) is protected by `pages.lock_version` optimistic concurrency (doc 06 §14) — a stale `expectedLockVersion` is `409`.
- `PagePublishingService.restore()` follows the exact precedent `ContentPublishingService.restore()` set for its own shared `events` sub-resource: rollback unconditionally replaces the current shared section structure with the snapshot's, since `page_sections`/`config`/`style` are locale-independent (doc 02 §8). See `docs/architecture/cms-page-builder.md` §6 for the resulting, currently-unresolved cross-locale tradeoff this implies.
- `POST /pages/:id/locales/:locale/preview` (design doc 02 §9 / doc 06 §5.2, §10) resolves and validates the exact same draft state `publish()` would snapshot, against the exact same Component Registry contract, but never creates a revision, moves the published pointer, or writes an audit record — `PagePublishingService.resolveDraftSnapshot()` is the one resolve-and-validate step both `publish()` and `preview()` share.

Verified over real HTTP against the dev API and real Postgres, with a real Keycloak-issued `super_admin` token: created a page, added a `hero` section using the component's own defaults, translated it, published it, and confirmed the anonymous delivery view matches the admin editorial view's data with hidden sections filtered and internal fields stripped; an unregistered `componentKey`, a stale `expectedLockVersion`, and an invalid style token each produced the expected `422`/`409`; reorder and restore-to-an-earlier-revision both verified against real data. Preview verified separately: an empty section list previews cleanly; a section missing its locale translation `422`s with `incomplete_translation`, same as publish would; a successful preview never changes `published_revision_id`/`status`; after publishing, further draft edits show up in a subsequent preview while the already-published delivery view keeps serving the old snapshot untouched; anonymous `401`s, an authenticated caller without `page.read` `403`s.

### What's still missing

- 19 more component contracts (doc 03 §21/§22) — each is real design work, not fabricated here.
- The Admin Page Editor UI (`apps/admin`) and the Next.js Web component renderer (`apps/web`) — neither exists yet.

## 3.12 Redirect Administration

**Status:** ✅ Complete **PR:** #21

### Relevant paths

```text
apps/api/src/redirects/
```

`apps/api/src/redirects/` implements the admin-only manual CRUD design doc 05 §12.1 describes for the existing `redirects` table (schema already shipped with the initial migration — this PR only adds the API surface). Unlike `content`/`menus`, `redirects` has no public-read concept of its own (doc 06 §5.2): resolving an incoming request against `public_routes` then `redirects` is the public routing layer's job (doc 05 §12.1's locale-specific → global → `404` order), not a JSON resource here, so every route requires `redirect.manage` outright.

`RedirectsService` enforces the business rules doc 05 §12.1 spells out that the DB's own constraints can't express on their own:

- a redirect must not shadow a path `public_routes` still serves live (`409`);
- a direct `A → B → A` loop is rejected (`422`);
- a `destinationPath` that is itself already an active redirect source is rejected as a chain (`422`) — the caller is told the final destination to point at directly instead, per doc 05 §12.1's "nên: `/old-a → /new-c`; không nên: `/old-a → /old-b → /new-c`".

`locale`/`sourcePath` are immutable after creation, the same precedent `page_sections.componentKey` sets; `PATCH` only accepts `destinationPath`/`statusCode`/`isActive`, and only re-runs the loop/chain checks when `destinationPath` actually changes.

Verified over real HTTP against the dev API and real Postgres, with a real Keycloak-issued `super_admin` token: created a locale-specific redirect and a global (`locale` omitted) one, listed and filtered by locale, updated and deactivated a rule, deleted a rule; a self-redirect, a duplicate active source, a bad path format, a live-route shadow, a direct loop, and a chain (both on create and on a `PATCH` that would introduce one) each produced the expected `409`/`422` with precise field-level errors; all test rows and the temporary role grant cleaned up after.

## 3.13 Site Settings

**Status:** ✅ Complete **PR:** #22

### Relevant paths

```text
apps/api/src/settings/
```

`apps/api/src/settings/settings.catalog.ts` is the Settings Registry §5.1 (below, formerly §5.2) said didn't exist: a fixed `SETTINGS_CATALOG` mapping each of design doc 05 §12.2's four example keys (`site.contact`, `site.social_links`, `seo.defaults`, `features.public`) to a Zod schema. Every field in every schema is sourced from what `https://ttu.edu.vn/` — the live WordPress site this platform replaces — actually renders today (footer phone/email/hours/map embed, header/footer social icons, `og:`/`twitter:` meta tags, the homepage's "EVENTS" widget), not invented. `site_settings` has no `locale` column, so fields that are genuinely per-locale on the live site (org name, postal address, SEO copy) are locale-keyed records nested inside one key's JSONB `value`, keyed by `locales.code` rather than a hardcoded `vi`/`en` union.

`SiteSettingsController` has no RBAC branch: every catalog key is public-safe by design (they are all things the public website itself needs), and there is no draft/published split to hide from an unprivileged caller, so `GET /settings`/`GET /settings/:key` carry no guard at all — only `PUT /settings/:key` requires `settings.manage`. `SiteSettingsService` validates `value` against the matching Zod schema on every write (`422` with field-level errors, including unrecognized extra fields on each `.strict()` schema); an unknown key is `404` on every route.

`db:seed` now also seeds real bootstrap values for all 4 keys (insert-if-missing, so a later re-seed never overwrites a real admin edit made through the API), grounded in the same live-site read.

Verified over real HTTP against the dev API and real Postgres, with a real Keycloak-issued `super_admin` token: `db:seed` populated all 4 real settings; anonymous `GET /settings` and `GET /settings/:key` returned them without a token; an unknown key was `404` on both read and write; `PUT` without a token was `401`; a valid `PUT` updated `features.public` and a subsequent anonymous `GET` reflected it; a payload missing required `site.contact` fields, an unrecognized extra field on `site.social_links`, and an invalid email on `site.contact` each produced the expected `422` naming the exact field; the modified setting was restored to its seeded value and the temporary role grant revoked after.

## 3.14 Public Route Resolution

**Status:** ✅ Complete **PR:** #23

### Relevant paths

```text
apps/api/src/routing/
```

`GET /api/v1/routes/resolve?locale=&path=` implements design doc 05 §12.1's exact resolve order for `apps/web`: check `public_routes(locale, path)` first — a live entry always wins; if none, fall through to `redirects` (locale-specific before the global `locale IS NULL` fallback tier, reusing `RedirectsRepository.findActiveMatchesForLocale` exported from `RedirectsModule`); otherwise `404`. Returns a routing pointer only (`{ type: 'page', pageId }` / `{ type: 'content', contentId }` / `{ type: 'redirect', destinationPath, statusCode }`), never the rendered resource — `apps/web` makes one further `GET /pages/:id`/`GET /content/:id` call once it knows the type, so this never duplicates `PagesController`'s/`ContentController`'s own delivery-view logic. Public, unauthenticated.

Verified over real HTTP against the dev API and real Postgres: seeded a real `public_routes` row for each target type, a locale-specific redirect, a global redirect, and a same-source locale-vs-global priority pair — resolving each path returned the correct pointer/redirect target; a locale-specific redirect correctly won over an active global rule for the identical source path; a path with no match anywhere was `404`; a malformed `path` and a missing `locale` were each `422`; all seeded rows cleaned up after.

## 3.15 Structured Logging (Pino)

**Status:** ✅ Complete **PR:** #25

### Relevant paths

```text
apps/api/src/common/logging/logger.module.ts
apps/api/src/config/logging.ts
```

`LoggerModule` wires `nestjs-pino`'s `LoggerModule.forRoot()` globally; `main.ts` calls `app.useLogger(app.get(Logger))` (the `Logger` `nestjs-pino` exports) so every `@nestjs/common` `Logger` call — Nest's own framework startup logs included — routes through Pino instead of the default console logger, and the `pino-http` middleware it installs emits one structured line per HTTP request/response (design doc 06 §16 keeps this a separate stream from the `audit_logs` security trail — see `docs/api/conventions.md` §5).

`genReqId` reuses an inbound `x-request-id` header (doc 06 §15's cross-service correlation ID) and echoes it back on the response, otherwise mints a UUID. `AllExceptionsFilter` now reads that same `request.id` back onto the error envelope's `requestId` field instead of minting an unrelated `randomUUID()` per error — one identifier ties the access log line, any 5xx error log, and the client-visible error response together. `req.headers.authorization`/`req.headers.cookie`/`res.headers["set-cookie"]` are redacted before a line is ever written (doc 06 §16: "Không lưu password, access token, refresh token hoặc secret vào log/audit"). Log level follows response status: 5xx → `error`, 4xx → `warn`, else `info`. `LOG_LEVEL` (`.env`, default `info`) controls verbosity; output is pretty-printed outside `NODE_ENV=production`, plain NDJSON to stdout in production.

Verified over real HTTP against the dev API: Nest's own startup/route-mapping logs render through Pino; a request carrying `x-request-id: my-custom-trace-id` is echoed on the response and appears as `req.id` on the matching access log line; the identical header value on a request that 401s appears as both `req.id` in the `WARN`-level access log line and `requestId` in the JSON error envelope; a request with a real `Authorization: Bearer …` header logs `"authorization":"[redacted]"`, never the real token.

# 4. Blocked

## 4.1 Remaining CMS Page Builder Component Contracts and Admin/Web UI

**Status:** 🔴 Blocked

The Page/Section/Preview/Publish/Rollback API and the Component Registry engine are implemented (§3.11). What remains blocked:

### Component contracts beyond `hero`

Design doc 03 §21 names ~19 more components (`cta`, `image-banner`, `statistics`, `rich-text`, `image-text`, `columns`, `spacer`, `news-grid`, `announcement-list`, `event-list`, `featured-article`, `faculty-grid`, `program-grid`, `people-grid`, `research-highlight`, `gallery`, `video`, `partner-logos`, `quick-links`) but only as category placeholders — a key and a one-line purpose, not the field-level `contentSchema`/`configSchema`/`styleSchema`/defaults/`editorMetadata` doc 03 §22 requires before a component can actually be registered. Registering one without that contract means inventing product and design decisions.

> Do not register a component from the doc 03 §21 list without first writing its complete contract (doc 03 §22's checklist). A category name and a purpose sentence are not a contract.

### Admin Page Editor UI

`apps/admin` has no Page Builder screens — no Component Library, Live Preview, or Inspector (doc 02 §6). It calls `GET /api/v1/me` only (see `apps/admin/IMPLEMENTATION_STATUS.md`).

### Web component renderer

`apps/web` has no `@ttu/cms-registry` consumer — no code maps a `(componentKey, componentVersion)` to a React component (doc 03 §19). It is still the default Next.js scaffold (see `apps/web/IMPLEMENTATION_STATUS.md`).

---

# 5. Backlog

The following domains are known but are not currently part of the implementation queue.

---

## 5.1 Public Website Integration

**Status:** ⚪ Not started

Current application:

```text
apps/web
```

is still the default Next.js scaffold.

It does not currently consume the Public API.

Expected future relationship:

```text
apps/web
   ↓
Public API
   ↓
Content / Pages / Navigation / Settings
```

This should be implemented only after enough public-facing backend domains are available — as of PR #23, Content, Pages, Navigation, Settings, and public route resolution all exist. This is entirely `apps/web` scope now; `apps/api` has nothing left to build for it speculatively.

---

## 5.2 WordPress Migration Tooling

**Status:** ⚪ Not started **Reference:** Design document 09

No migration tooling currently exists.

Expected future scope includes migration of legacy WordPress data into `ttu-platform`.

Implementation has not yet been scoped.

---

# 6. Dependency Map

Current high-level dependencies:

```text
ttu-data-infra
├── PostgreSQL
│   └── ttu_main
│
└── MinIO
    └── Media storage


ttu-identity
└── Keycloak
    └── Authentication


ttu-platform
├── apps/api
│   ├── Access / Authorization       ✅
│   ├── Content                      ✅
│   ├── Taxonomy                     ✅
│   ├── Media                        ✅
│   ├── Pages                        🟠 partial (hero only, no more components)
│   ├── Navigation                   ✅
│   ├── Redirects                    ✅
│   ├── Settings                     ✅
│   ├── Route resolution             ✅
│   └── Audit API                    ✅
│
├── apps/admin
│   ├── OIDC login                   ✅
│   └── Page Editor UI               ⏳
│
├── apps/web
│   ├── Public API integration       ⏳
│   └── Component renderer           ⏳
│
└── packages
    └── cms-registry                 🟠 partial (engine done, only hero registered)
```

---

# 7. Recommended Implementation Order

Unless requirements change, backend work should proceed in this order:

1. Write full field-level contracts for more doc 03 §21 components, as real product/design work justifies each
2. Admin Page Editor UI, against the now-existing Page/Section API
3. Web component renderer + apps/web public API integration (Content, Pages, Navigation, Settings, and route resolution backends all now exist — this is entirely apps/web scope now)
4. WordPress migration tooling, once scoped

This order is based on implementation dependencies rather than feature visibility.

---

# 8. Rules for Future Implementation

Before starting a new backend domain:

1. Check this file.
2. Check the relevant design document.
3. Confirm required database tables already exist.
4. Confirm dependencies are implemented.
5. Do not invent missing business rules.
6. Do not implement blocked areas speculatively.
7. Follow the wiring order defined in [`../../AGENTS.md`](../../AGENTS.md).
8. Add tests for the implemented behavior.
9. Update [`../../docs/setup.md`](../../docs/setup.md) if new setup or verification steps are introduced.
10. Update this file when implementation status changes.
11. Record the change in [`../../CHANGELOG.md`](../../CHANGELOG.md) if it is a major change (new domain, schema change, new app surface, breaking API change).

---

# 9. Updating This File

When a PR is merged:

### Move the feature

```text
Next / Planned
      ↓
Completed
```

### Update

- status;
- PR number;
- relevant paths;
- implemented capabilities;
- remaining limitations;
- new dependencies discovered.

Do not keep detailed implementation history here after a feature is complete.

Git remains the source of truth for historical changes; [`../../CHANGELOG.md`](../../CHANGELOG.md) is the human-readable summary of historical changes.

This document describes the **current state of the repository**, not a changelog.

---

## Last Known Implementation State

```text
Latest completed backend domain:
Public Route Resolution (#23); CMS Page Builder Preview endpoint (#24); Structured Pino logging (#25)

Current priority:
None — every queued backend domain is complete or partial-as-specified; see §2

Next:
A doc 03 §21 component's full contract, the Admin Page Editor UI / Web renderer against the existing Page/Section/Preview API, or wiring apps/web to the now-complete public-facing backends (Content, Pages, Navigation, Settings, route resolution) — apps/api has no more speculative backend work to do

Primary blocker:
Product/design specification for any component beyond hero (doc 03 §22); WordPress Migration Tooling additionally needs real legacy data access to scope against
```
