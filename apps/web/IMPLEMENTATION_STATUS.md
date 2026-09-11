# TTU Platform — Public Website Implementation Status

> Living implementation tracker for the `@ttu/web` application (`apps/web`).

Read this file before modifying `apps/web` to understand implemented surfaces, current priorities, and dependencies on `apps/api` endpoints and shared packages.

- [**Root Monorepo Status**](../../IMPLEMENTATION_STATUS.md)
- [**Backend API Status**](../api/IMPLEMENTATION_STATUS.md)
- [**Admin Dashboard Status**](../admin/IMPLEMENTATION_STATUS.md)

---

## 1. Current Status

| # | Feature Domain | Status | API Dependency | Notes |
| --: | :-- | :-- | :-- | :-- |
| 1 | **Application Scaffold** | ✅ Complete | None | Next.js 16 (App Router), React 19, Tailwind CSS 4 |
| 2 | **Baseline Layout & Shell** | ✅ Complete | None | Global layout, base Header, Footer, not-found, robots, sitemap |
| 3 | **Public API Client & Caching** | 🟡 Next | `apps/api` public routes | Fetch wrapper with Next.js ISR/tag-based revalidation |
| 4 | **Multilingual Routing (`vi`/`en`)** | 🟡 Next | None | Next.js localized subpaths or headers, locale switcher |
| 5 | **Content & News Portal** | ⚪ Not started | `/api/v1/content` | News feed, event calendar, category filtering, search |
| 6 | **Article & Event Detail Pages** | ⚪ Not started | `/api/v1/content/by-slug/:locale/:slug` | Server-rendered published snapshot display, OpenGraph tags |
| 7 | **Academic Programs Showcase** | ⚪ Not started | None | School-wide degree catalog (undergraduate, graduate, medical) — no backend domain exists yet |
| 8 | **Faculty Portals Directory** | ⚪ Not started | None | Curated link directory out to `*.ttu.edu.vn` (sibling platform) |
| 9 | **Admissions Landing Pages** | ⚪ Not started | None | Marketing pages for admissions cycles, tuition fees, inquiry form |
| 10 | **CMS Page Builder Renderer** | ⚪ Not started | `/api/v1/pages/by-slug/:locale/:slug` | Dynamic section renderer; API is ready (`apps/api/src/cms/`), but `@ttu/cms-registry` only has `hero` registered |
| 11 | **Dynamic Navigation Menus** | ⚪ Backlog | `/api/v1/menus/:key` | Header & footer navigation driven by the CMS menu endpoint |
| 12 | **SEO & Structured Data** | ⚪ Backlog | None | JSON-LD schema (EducationalOrganization, Article, Event) |

### Status legend

| Status         | Meaning                                       |
| :------------- | :-------------------------------------------- |
| ✅ Complete    | Implemented and verified in `main`            |
| 🟡 Next        | Immediate implementation priority             |
| ⚪ Not started | Planned feature; prerequisites exist          |
| 🔴 Blocked     | Blocked on backend endpoint or shared package |

---

## 2. Immediate Priorities

The current frontend implementation sequence for `apps/web` is:

```text
1. Public API Client & Tag-based Caching (apps/api public endpoints)
   ↓
2. Multilingual Routing Setup (/vi and /en localized paths)
   ↓
3. Content & News Portal (/tin-tuc, /su-kien, article detail rendering)
   ↓
4. Academic Programs Catalog (University-wide degrees showcase)
```

---

## 3. Detailed Domain Specifications

### 3.1 Content & Editorial Consumption (Priority 1)

- **Feed Views**: Server-rendered list views for News, Announcements, Press Releases, and Events with pagination.
- **Published Snapshot Isolation**: The public site only reads published snapshots from `content_revisions` joined via `published_revision_id`. It never sees unpublished draft edits (verified in PR #11).
- **Events**: Dedicated event cards displaying start/end date, location, registration status, and calendar export.

### 3.2 Academic Programs & Faculty Links (Priority 2)

- **Centralized Degree Directory**: Displays university-level programs from `programs` and `program_translations` tables.
- **Faculty Boundaries**: Links out to specific faculty sites (e.g. Medicine, Engineering, Biotechnology). Per `AGENTS.md`, faculty-specific data lives in `ttu-faculty-platform`, not here.

### 3.3 Blocked Domains

- **CMS Page Builder Renderer**: Intentionally blocked. Do not invent page section renderers or component definitions until `packages/cms-registry` defines the official component catalog and validation schemas.
