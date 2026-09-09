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

|   # | Domain                      | Status         | PR / Reference    |
| --: | --------------------------- | -------------- | ----------------- |
|   1 | Database schema             | ✅ Complete    | Design docs       |
|   2 | Database infrastructure     | ✅ Complete    | PR #9             |
|   3 | Identity & authorization    | ✅ Complete    | PR #10            |
|   4 | Content & taxonomy          | ✅ Complete    | PR #11            |
|   5 | Role → permission grants    | ✅ Complete    | PR #15            |
|   6 | Media / MinIO               | ⚪ Not started | Design doc 08     |
|   7 | Admin authentication UI     | ⚪ Not started | —                 |
|   8 | CMS Page Builder            | 🔴 Blocked     | Design docs 02–03 |
|   9 | Navigation                  | ⚪ Backlog     | —                 |
|  10 | Redirect administration     | ⚪ Backlog     | —                 |
|  11 | Site settings               | ⚪ Backlog     | Design doc 06 §12 |
|  12 | Audit log API               | ⚪ Backlog     | —                 |
|  13 | Public website integration  | ⚪ Backlog     | —                 |
|  14 | WordPress migration tooling | ⚪ Backlog     | Design doc 09     |

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

The current backend implementation order is:

```text
Media domain / MinIO
        ↓
Admin OIDC sign-in
```

The CMS Page Builder must **not** be implemented yet because its Component Registry does not exist.

Current implementation target:

```text
#6 Media / MinIO
```

---

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

# 4. Next Implementation

## 4.1 Media Domain / MinIO

**Status:** ⚪ Not started **Reference:** Design document 08

### Existing database schema

Already available:

```text
media_assets
media_translations
```

The schema was created during the database implementation.

No media application domain exists yet.

---

### Required implementation

Create:

```text
apps/api/src/media/
```

Expected responsibilities:

- upload media;
- validate uploaded files;
- persist media metadata;
- store objects in MinIO;
- retrieve media metadata;
- manage translations/alt text;
- delete/archive assets according to specification.

---

### Infrastructure

Object storage comes from:

```text
ttu-data-infra
```

using MinIO.

Expected application configuration:

```text
S3_ENDPOINT
S3_REGION
S3_BUCKET
S3_ACCESS_KEY
S3_SECRET_KEY
```

Exact variable names should follow the repository configuration conventions.

---

### Important

Do not store uploaded binary files in PostgreSQL.

Architecture:

```text
Client
  ↓
ttu-platform API
  ├── metadata → PostgreSQL
  └── object   → MinIO
```

---

## 4.2 Admin Authentication UI

**Status:** ⚪ Not started

### Current state

The API already validates Keycloak tokens.

However:

```text
apps/admin
```

does not currently perform the browser-side login flow.

Nothing in `apps/admin` currently authenticates with Keycloak or consumes the admin API.

---

### Required flow

Use:

```text
OpenID Connect
Authorization Code Flow
PKCE
```

with the existing Keycloak client:

```text
ttu-web
```

Expected browser flow:

```text
Admin
  ↓
apps/admin
  ↓
Keycloak login
  ↓
Authorization Code
  ↓
PKCE token exchange
  ↓
Access Token
  ↓
ttu-platform API
```

---

### Initial integration target

After authentication:

```http
GET /api/v1/admin/me
```

should be used to obtain the current local admin identity and permission state.

---

# 5. Blocked

## 5.1 CMS Page Builder

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

# 6. Backlog

The following domains are known but are not currently part of the implementation queue.

---

## 6.1 Navigation

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

## 6.2 Redirect Administration

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

## 6.3 Site Settings

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

## 6.4 Audit Log API

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

## 6.5 Public Website Integration

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

## 6.6 WordPress Migration Tooling

**Status:** ⚪ Not started **Reference:** Design document 09

No migration tooling currently exists.

Expected future scope includes migration of legacy WordPress data into `ttu-platform`.

Implementation has not yet been scoped.

---

# 7. Dependency Map

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
│   ├── Media                        ⏳
│   ├── Pages                        🚫 blocked
│   ├── Navigation                   ⏳
│   ├── Settings                     ⏳
│   └── Audit API                    ⏳
│
├── apps/admin
│   └── OIDC login                   ⏳
│
├── apps/web
│   └── Public API integration       ⏳
│
└── packages
    └── cms-registry                 ❌ missing
```

---

# 8. Recommended Implementation Order

Unless requirements change, backend work should proceed in this order:

```text
1. Media domain
2. Admin authentication UI
3. Component Registry
4. CMS Page Builder
5. Navigation
6. Site Settings
7. Audit Log API
8. apps/web integration
9. WordPress migration tooling
```

This order is based on implementation dependencies rather than feature visibility.

---

# 9. Rules for Future Implementation

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

# 10. Updating This File

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
Role → Permission Grants (#5)

Current priority:
Media Domain (#6)

Next:
Admin Authentication UI (#7)

Primary blocker:
CMS Component Registry
```
