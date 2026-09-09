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
| 2 | **Identity & Access Control** | Keycloak SSO verification (`JwtAuthGuard`), local RBAC (`PermissionsGuard`) | ✅ Complete | Token verification, permission catalog, JIT sync |
| 3 | **Content & Taxonomy Domain** | Multi-type content (News, Events, Articles), categories/tags, revisions | ✅ Complete | Draft → publish → immutable revision → rollback transaction |
| 4 | **Test Suite Reorganization** | Relocate spec tests into `apps/api/test/` with `@/` path alias | ✅ Complete | PR #13 merged; 26 unit tests passing |
| 5 | **Media Storage Integration** | MinIO S3 client, upload endpoints, asset metadata & translations | ⚪ Next | Design doc 08; wire when real upload endpoint is implemented |
| 6 | **Admin OIDC Authentication** | Browser-side Keycloak redirect (`ttu-web` client) in Admin dashboard | ⚪ Next | Enables admin user sign-in and session management |
| 7 | **CMS Component Registry** | Shared package defining ~15–20 page components and validation schemas | 🔴 Blocked | Required before CMS Page Builder (`pages`/`page_sections`) |
| 8 | **CMS Page Builder** | Page drafts, section ordering, visual editing, published revisions | 🔴 Blocked | Depends on Milestone 7 (Component Registry) |
| 9 | **Public Content Consumption** | Public website fetching news, events, taxonomies, and static routes | ⚪ Backlog | Consumes `/api/v1/public/*` endpoints |
| 10 | **Production Deployment** | Multi-stage Dockerfiles, Docker Compose joining `ttu-backend` network | ⚪ Backlog | Server deployment with host Nginx reverse proxy |

---

## 3. Application Status Summaries

### 3.1 Backend API (`apps/api`)

- **Current State**: Database schema (36 tables) is fully wired against `ttu_main`. Core authentication guard verifies Keycloak JWTs and checks permissions against local database roles. Content and Taxonomy modules are fully operational with immutable revision snapshots, category/tag assignments, and automated 301 redirect generation on path changes.
- **Next Priorities**: Grant role permissions for non-superadmin roles (`role.manage`), followed by MinIO storage integration for asset uploads.
- **Detailed Tracking**: See [`apps/api/IMPLEMENTATION_STATUS.md`](apps/api/IMPLEMENTATION_STATUS.md).

### 3.2 Admin Dashboard (`apps/admin`)

- **Current State**: Project is scaffolded on Next.js 16 App Router with React 19 and Tailwind CSS 4. Basic layout, navigation header, and root page exist as placeholders. No API communication or authentication is wired up yet.
- **Next Priorities**: Implement browser-side OIDC authentication flow against Keycloak (`ttu-web` client), hydrate authenticated user profile and permissions via `GET /api/v1/admin/me`, and build initial Content and Taxonomy management views.
- **Detailed Tracking**: See [`apps/admin/IMPLEMENTATION_STATUS.md`](apps/admin/IMPLEMENTATION_STATUS.md).

### 3.3 Public Website (`apps/web`)

- **Current State**: Project is scaffolded on Next.js 16 App Router with React 19 and Tailwind CSS 4. Basic header, footer, layout, not-found page, robots.txt, and sitemap.ts are present.
- **Next Priorities**: Integrate public content feeds from `apps/api` (`GET /api/v1/public/content`), implement article/news detail pages with SSR, build academic program listing pages, and configure multilingual routing (`vi`/`en`).
- **Detailed Tracking**: See [`apps/web/IMPLEMENTATION_STATUS.md`](apps/web/IMPLEMENTATION_STATUS.md).

---

## 4. Architecture & Wiring Constraints

Strict guidelines enforced across the monorepo (see [`AGENTS.md`](AGENTS.md)):

1. **Do not build ahead of wiring order**:
   - Do not add an S3/MinIO client speculatively; wire it when a real upload endpoint needs it (doc 08).
   - Do not add `pages`/`page_sections` endpoints or invent fake component schemas; wait for the Component Registry (`packages/cms-registry`).
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
