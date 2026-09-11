# Frontend: Public Website (`@ttu/web`)

## 1. Application Architecture

The university public website is located in `apps/web`:

- **Framework**: Next.js 16 (App Router), React 19, Tailwind CSS 4.
- **Port**: `3000` (local development), mapped to `ttu.edu.vn` in production.
- **Target Audience**: Prospective students, enrolled students, faculty, researchers, alumni, and global visitors.
- **Global Header**: The Figma-aligned header is rendered by `@ttu/design-system` and its shared Tailwind classes are included through the `@source` directive in `apps/web/src/styles/globals.css`.
- **Homepage Hero**: The first section below the header follows Figma node `1387:181554`: a 597px desktop hero with the raw exported campus image, tokenized gradient overlay, aligned title and subtitle, and the exact exported admissions CTA arrow asset.
- **Homepage Introduction**: The hero shield decoration (`346:13801`), About content (`1998:189150`), and About CTA (`187:13163`) retain their Figma dimensions, spacing, typography, colors, and page order before the Statistics section.
- **Homepage Campus & Statistics**: The campus media frame (`209:16851`) uses the exact exported raster and centered 117px play asset; the Statistics frame (`189:13315`) preserves its 1216×455 desktop composition, 57px column gap, 809px gradient card, and Figma typography.

## 2. Rendering & Caching Strategy

- **Incremental Static Regeneration (ISR)**: Public article and page routes use Next.js tag-based revalidation (`revalidateTag()`), serving static HTML at edge speed while refreshing instantly upon publication.
- **Published Snapshot Isolation**: The public website exclusively requests data from `/api/v1/public/*`, ensuring visitor traffic is completely isolated from live draft edits.
- **Localized Subpaths**: Routes are localized using path prefixes (`/vi/...` and `/en/...`) with language switcher controls in the global header.

## 3. SEO & Structured Data

- **Dynamic OpenGraph**: OpenGraph images, titles, and descriptions are dynamically generated from `content_translations` / `page_translations`.
- **JSON-LD Schema**: Embeds structured data for `EducationalOrganization`, `NewsArticle`, and `Event` to maximize search engine discoverability.
- **Automated Sitemaps**: `apps/web/src/app/sitemap.ts` and `robots.ts` generate crawlable search engine manifests matching published routes.
