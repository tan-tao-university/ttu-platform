# Frontend: Public Website (`@ttu/web`)

## 1. Application Architecture

The university public website is located in `apps/web`:

- **Framework**: Next.js 16 (App Router), React 19, Tailwind CSS 4.
- **Port**: `3000` (local development), mapped to `ttu.edu.vn` in production.
- **Target Audience**: Prospective students, enrolled students, faculty, researchers, alumni, and global visitors.

## 2. Rendering & Caching Strategy

- **Incremental Static Regeneration (ISR)**: Public article and page routes use Next.js tag-based revalidation (`revalidateTag()`), serving static HTML at edge speed while refreshing instantly upon publication.
- **Published Snapshot Isolation**: The public website exclusively requests data from `/api/v1/public/*`, ensuring visitor traffic is completely isolated from live draft edits.
- **Localized Subpaths**: Routes are localized using path prefixes (`/vi/...` and `/en/...`) with language switcher controls in the global header.

## 3. SEO & Structured Data

- **Dynamic OpenGraph**: OpenGraph images, titles, and descriptions are dynamically generated from `content_translations` / `page_translations`.
- **JSON-LD Schema**: Embeds structured data for `EducationalOrganization`, `NewsArticle`, and `Event` to maximize search engine discoverability.
- **Automated Sitemaps**: `apps/web/src/app/sitemap.ts` and `robots.ts` generate crawlable search engine manifests matching published routes.
