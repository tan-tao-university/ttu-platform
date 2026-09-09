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

|   # | Domain                      | Status      | PR / Reference    |
| --: | --------------------------- | ----------- | ----------------- |
|   1 | Database schema             | ✅ Complete | Design docs       |
|   2 | Database infrastructure     | ✅ Complete | PR #9             |
|   3 | Identity & authorization    | ✅ Complete | PR #10            |
|   4 | Content & taxonomy          | ✅ Complete | PR #11            |
|   5 | Role → permission grants    | ✅ Complete | PR #15            |
|   6 | Media / MinIO               | ✅ Complete | PR #16            |
|   7 | Admin authentication UI     | ✅ Complete | `apps/admin` PR   |
|   8 | CMS Page Builder            | 🔴 Blocked  | Design docs 02–03 |
|   9 | Navigation                  | ⚪ Backlog  | —                 |
|  10 | Redirect administration     | ⚪ Backlog  | —                 |
|  11 | Site settings               | ⚪ Backlog  | Design doc 06 §12 |
|  12 | Audit log API               | ⚪ Backlog  | —                 |
|  13 | Public website integration  | ⚪ Backlog  | —                 |
|  14 | WordPress migration tooling | ⚪ Backlog  | Design doc 09     |

### Status legend

| Status         | Meaning                                                           |
| -------------- | ----------------------------------------------------------------- |
| ✅ Complete    | Implemented and merged                                            |
| 🟡 Next        | Current or immediate implementation priority                      |
| 🔵 In progress | Actively being implemented                                        |
| ⚪ Not started | Known work but implementation has not started                     |
| 🔴 Blocked     | Must not be implemented until the dependency/specification exists |

---

# 2. Current Priority

Every backend domain in the original priority queue (role → permission grants, media/MinIO, admin authentication UI) is now complete.

No backend domain is currently prioritized ahead of the others. The next concrete step is either:

```text
promote a Backlog item (§5) to Next explicitly, or
unblock CMS Page Builder via the Component Registry (§4.1)
```

The CMS Page Builder must **not** be implemented yet because its Component Registry does not exist.

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
GET /api/v1/admin/me
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
- `controllers/admin-media.controller.ts` — `GET/POST /api/v1/admin/media`, `GET /api/v1/admin/media/:id`, `PUT /api/v1/admin/media/:id/translations/:locale`, `DELETE /api/v1/admin/media/:id`, `POST /api/v1/admin/media/:id/restore`.

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
- `GET /api/v1/admin/me` is called server-side with the session's access token on every page load to hydrate identity and the permission list.

Verified with a live browser against the real `ttu-identity` Keycloak dev instance and the real `apps/api` dev server: full login redirect through Keycloak's actual login form, callback, session cookie confirmed genuinely `HttpOnly` (`document.cookie` returns empty), `/admin/me` permission list rendered, and logout confirmed to clear the local session cookie.

# 4. Blocked

## 4.1 CMS Page Builder

**Status:** 🔴 Blocked

### Existing database schema

The following tables already exist:

```text
pages
page_sections
```

However, no Page Builder endpoints exist.

---

### Why implementation is blocked

Page publishing depends on a Component Registry.

Expected package:

```text
packages/cms-registry
```

That registry does not currently exist.

A page section contains values such as:

```text
component_key
component_version
config
style
```

These values must be validated against the Component Registry before a page can safely be published.

Conceptually:

```text
page_section
    │
    ├── component_key
    ├── component_version
    ├── config
    └── style
           │
           ▼
    Component Registry
           │
           ├── component exists?
           ├── version exists?
           ├── config valid?
           └── style valid?
```

---

### Missing product specification

The registry requires a real component set described by design documents 02–03.

Approximately:

```text
15–20 CMS components
```

are expected.

But the repository currently does not define their exact:

- component keys;
- versions;
- field schemas;
- validation rules;
- layout rules;
- style tokens;
- frontend mappings.

Creating these without a specification would mean inventing product and design decisions.

---

### Rule

> Do not implement Page Builder publishing, revision, rollback, or section validation until the Component Registry exists.

Database tables may remain unused until the dependency is implemented.

---

# 5. Backlog

The following domains are known but are not currently part of the implementation queue.

---

## 5.1 Navigation

**Status:** ⚪ Not started

Existing schema:

```text
menus
menu_items
```

No endpoints exist.

Full internal navigation depends partially on the Page Builder because menu items may reference internal pages.

Possible link types include:

```text
internal page
external URL
custom path
```

External/custom links could technically be implemented independently, but navigation should not be started unless explicitly prioritized.

---

## 5.2 Redirect Administration

**Status:** ⚪ Not started

Redirect rows are already generated automatically when Content publishing changes a public path.

Current capability:

```text
content path change
        ↓
automatic redirect
```

Missing capability:

```text
Admin manual redirect CRUD
```

No standalone redirect management API exists yet.

---

## 5.3 Site Settings

**Status:** ⚪ Not started **Reference:** Design document 06 §12

Existing schema:

```text
site_settings
```

No endpoints exist.

Implementation is additionally dependent on a Settings Registry describing:

- valid setting keys;
- types;
- validation;
- defaults;
- scopes.

The registry has not yet been implemented.

---

## 5.4 Audit Log API

**Status:** ⚪ Not started

Existing table:

```text
audit_logs
```

Audit records are already written by operations such as:

```text
publish
restore
```

Missing capability:

```http
GET /api/v1/admin/audit-logs
```

or equivalent administrative read surfaces.

---

## 5.5 Public Website Integration

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

This should be implemented only after enough public-facing backend domains are available.

---

## 5.6 WordPress Migration Tooling

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
│   ├── Pages                        🚫 blocked
│   ├── Navigation                   ⏳
│   ├── Settings                     ⏳
│   └── Audit API                    ⏳
│
├── apps/admin
│   └── OIDC login                   ✅
│
├── apps/web
│   └── Public API integration       ⏳
│
└── packages
    └── cms-registry                 ❌ missing
```

---

# 7. Recommended Implementation Order

Unless requirements change, backend work should proceed in this order:

```text
1. Component Registry
2. CMS Page Builder
3. Navigation
4. Site Settings
5. Audit Log API
6. apps/web integration
7. WordPress migration tooling
```

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
Admin Authentication UI (#7)

Current priority:
None — every queued backend domain is complete; see §2

Next:
Component Registry (packages/cms-registry) → CMS Page Builder (#8)

Primary blocker:
CMS Component Registry
```
