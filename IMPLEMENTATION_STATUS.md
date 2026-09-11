# TTU Platform — Monorepo Implementation Status

> Living master implementation tracker for the `ttu-platform` repository.

This document tracks the overall architectural progress and cross-application milestones of the TTU Platform monorepo. For domain-specific technical details, refer to the dedicated implementation status files:

- [**Backend API Status**](apps/api/IMPLEMENTATION_STATUS.md) (`apps/api`)
- [**Admin Dashboard Status**](apps/admin/IMPLEMENTATION_STATUS.md) (`apps/admin`)
- [**Public Website Status**](apps/web/IMPLEMENTATION_STATUS.md) (`apps/web`)

---

## 1. Monorepo Overview

| Application / Package | Directory | Role | Status | Lead Technologies |
| :-- | :-- | :-- | :-- | :-- |
| **Backend API** (`@ttu/api`) | `apps/api` | Centralized REST API, business logic & persistence | 🔵 Active Build-out | NestJS 11, Drizzle ORM, PostgreSQL, Keycloak |
| **Admin Dashboard** (`@ttu/admin`) | `apps/admin` | Editorial and administrative portal | ⚪ Scaffolded | Next.js 16, React 19, Tailwind CSS 4 |
| **Public Website** (`@ttu/web`) | `apps/web` | Public university portal (ttu.edu.vn) | ⚪ Scaffolded | Next.js 16, React 19, Tailwind CSS 4 |
| **CMS Registry** (`@ttu/cms-registry`) | `packages/cms-registry` | Shared CMS Component Registry & schemas | 🔴 Blocked / Scoping | TypeScript, Zod, React 19 component definitions |

### Status legend

| Status              | Meaning                                                                 |
| :------------------ | :---------------------------------------------------------------------- |
| ✅ Complete         | Implemented, tested, and merged into `main`                             |
| 🟡 Next             | Immediate implementation priority                                       |
| 🔵 Active Build-out | Core domain implemented; actively expanding capabilities                |
| ⚪ Scaffolded       | Project skeleton exists; business features pending backend/dependencies |
| 🔴 Blocked          | Awaiting formal specification or prerequisite package                   |

---

## 2. Cross-Cutting Milestones

| # | Milestone | Target Scope | Status | Notes |
| --: | :-- | :-- | :-: | :-- |
| 1 | **Database & Persistence** | 36 physical tables in `ttu_main`, Drizzle ORM, connection pool | ✅ Complete | Migrations 0000–0002 merged; aligned with Notion doc 05 |
| 2 | **Identity & Access Control** | Keycloak SSO verification (`JwtAuthGuard`), local RBAC (`PermissionsGuard`) | ✅ Complete | Token verification, permission catalog, and role → permission grants for all 5 seeded roles |
| 3 | **Content & Taxonomy Domain** | Multi-type content (News, Events, Articles), categories/tags, revisions | ✅ Complete | Draft → publish → immutable revision → rollback transaction |
| 4 | **Test Suite Reorganization** | Relocate spec tests into `apps/api/test/` with `@/` path alias | ✅ Complete | PR #13 merged; 33 unit tests passing |
| 5 | **Media Storage Integration** | MinIO S3 client, upload endpoints, asset metadata & translations | ✅ Complete | `ttu-media` public bucket, scoped app credential, MIME/size/signature validation, delete-reference protection |
| 6 | **Admin OIDC Authentication** | Browser-side Keycloak redirect (`ttu-web` client) in Admin dashboard | ✅ Complete | Authorization Code + PKCE, encrypted `HttpOnly` session cookie, automatic refresh; verified against real Keycloak dev instance |
| 7 | **Navigation / Menus** | Hierarchical menus, 5 link types, admin CRUD, resolved public tree | ✅ Complete | Verified against real Postgres + HTTP; `docs/architecture/navigation.md` |
| 8 | **CMS Component Registry** | Shared package defining ~15–20 page components and validation schemas | 🔵 Active Build-out | `packages/cms-registry`: engine + Level A style tokens implemented; only `hero` v1 registered |
| 9 | **CMS Page Builder** | Page drafts, section ordering, visual editing, preview, published revisions | 🔵 Active Build-out | `apps/api/src/cms/`: Page/Section/Preview/Publish/Rollback API complete; Admin editor UI and Web renderer not started |
| 10 | **Public Content Consumption** | Public website fetching news, events, taxonomies, and static routes | ⚪ Backlog | Consumes the unprivileged branch of `/api/v1/content*` and `/api/v1/menus/:key` |
| 11 | **Production Deployment** | Multi-stage Dockerfiles, Docker Compose joining `ttu-backend` network | ⚪ Backlog | Server deployment with host Nginx reverse proxy |
| 12 | **Audit Log API** | Read-only, paginated, filterable surface over `audit_logs` | ✅ Complete | `audit.read`, `super_admin`-only; verified against real Postgres + HTTP |
| 13 | **Structured Logging** | Pino-based HTTP access/application logging, request-ID correlation, credential redaction | ✅ Complete | `apps/api/src/common/logging/`; see `docs/api/conventions.md` §5 |

---

## 3. Application Status Summaries

### 3.1 Backend API (`apps/api`)

- **Current State**: Database schema (36 tables) is fully wired against `ttu_main`. Core authentication guard verifies Keycloak JWTs and checks permissions against local database roles; all 5 seeded roles carry an explicit, documented permission grant set. Content and Taxonomy modules are fully operational with immutable revision snapshots, category/tag assignments, and automated 301 redirect generation on path changes. The Media domain (`apps/api/src/media/`) uploads to and deletes from `ttu-data-infra`'s MinIO instance with server-side MIME/size/signature validation and delete-reference protection against published content. Content and Navigation are each a single resource at a single URL, RBAC-branched (`content.read`/`navigation.manage`) between the full editorial view and the published-only delivery view — see `docs/api/conventions.md` §1. The Component Registry (`packages/cms-registry`) and the CMS Page Builder API (`apps/api/src/cms/`) are implemented against that pattern too, but only `hero` v1 is registered — see `docs/architecture/cms-page-builder.md` and `docs/architecture/component-registry.md`. `apps/api/src/redirects/` adds admin-only manual redirect CRUD (`redirect.manage`) on top of the automatic redirect generation above, rejecting shadowed live routes, loops, and chains. `apps/api/src/settings/` implements the Settings Registry (`SETTINGS_CATALOG`, 4 Zod-validated keys sourced from the live `ttu.edu.vn` site) with public reads and `settings.manage`-gated writes. `apps/api/src/routing/` implements `GET /routes/resolve` — the single public lookup that will let `apps/web` decide whether an incoming path is a live Page, live Content, a redirect, or a genuine 404.
- **Next Priorities**: Content and Taxonomy management views in the Admin dashboard, or wiring `apps/web` to the now-complete public-facing backends (Content, Pages, Navigation, Settings, route resolution). `apps/api` has no more unblocked backend work — remaining backlog (Public Website Integration, WordPress Migration Tooling) is `apps/web` scope or needs real legacy data access to scope.
- **Detailed Tracking**: See [`apps/api/IMPLEMENTATION_STATUS.md`](apps/api/IMPLEMENTATION_STATUS.md).

### 3.2 Admin Dashboard (`apps/admin`)

- **Current State**: Next.js 16 App Router with React 19 and Tailwind CSS 4. Browser-side sign-in against Keycloak (`ttu-web` client) is implemented as a server-side Authorization Code + PKCE flow: encrypted `HttpOnly` session cookie, automatic token refresh in `proxy.ts`, and `GET /api/v1/me` hydration on every page load. No content/taxonomy management views yet.
- **Next Priorities**: Application shell (sidebar, breadcrumbs, permission-gated navigation), then Content and Taxonomy management views.
- **Detailed Tracking**: See [`apps/admin/IMPLEMENTATION_STATUS.md`](apps/admin/IMPLEMENTATION_STATUS.md).

### 3.3 Public Website (`apps/web`)

- **Current State**: Project is scaffolded on Next.js 16 App Router with React 19 and Tailwind CSS 4. Basic header, footer, layout, not-found page, robots.txt, and sitemap.ts are present.
- **Next Priorities**: Integrate public content feeds from `apps/api` (`GET /api/v1/content`, anonymous), implement article/news detail pages with SSR, build academic program listing pages, and configure multilingual routing (`vi`/`en`).
- **Detailed Tracking**: See [`apps/web/IMPLEMENTATION_STATUS.md`](apps/web/IMPLEMENTATION_STATUS.md).

---

## 4. Architecture & Wiring Constraints

Strict guidelines enforced across the monorepo (see [`AGENTS.md`](AGENTS.md)):

1. **Do not build ahead of wiring order**:
   - Do not add an S3/MinIO client speculatively; wire it when a real upload endpoint needs it (doc 08).
   - `pages`/`page_sections` endpoints and the Component Registry (`packages/cms-registry`) are implemented, but only `hero` v1 is registered — do not register another component name without first writing its full field-level contract (design doc 03 §22); a category placeholder name is not a contract.
2. **Sibling infrastructure ownership**:
   - `ttu-data-infra` owns shared PostgreSQL and MinIO instances.
   - `ttu-identity` owns Keycloak realm configuration and clients (`ttu-web`).
   - `ttu-faculty-platform` owns faculty sites (`*.ttu.edu.vn`); this repo only links to them.
3. **Quality gates must pass before merge**:
   - `bun run format:check` (oxfmt with `proseWrap: "never"` and `jsdoc: true`)
   - `bun run lint` (oxlint with JSDoc plugin + ESLint)
   - `bun run duplication` (jscpd < 3%)
   - `bun run knip` (zero dead code or unused exports)
   - `moon run :typecheck` (TypeScript across all apps)
   - `moon run api:test` (NestJS unit tests in `apps/api/test/`)
   - `moon run :build` (production builds for all apps)
