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
- **Homepage Why TTU**: The differentiators section follows Figma node `1275:174036` with the light campus background, five green feature groups, the lower-right gate cutout, and the orange/green baseline at the original 1280px desktop coordinates while collapsing to a single-column mobile layout.
- **Homepage Training Systems**: The four-card training-system grid follows Figma node `190:13321` with the 287px heading column, 744px card grid, original image exports, and exact green type hierarchy.
- **Homepage Partners**: The five-company strip follows Figma node `204:16456` with exact logo exports and typography, a gentle seamless horizontal marquee, hover/focus pause behavior, responsive card widths, and a static horizontally scrollable fallback for reduced-motion users.
- **Homepage Regular Programs**: The seven-faculty directory follows Figma nodes `190:13394` and `1275:174037` on the `#ECECEC` surface with its 1280×1469 desktop composition, original faculty icons, exported CTA arrow, lower-right shield vector, and orange/green baseline.
- **Homepage Scholarships**: The 2026 scholarship section follows Figma node `1005:175084` with its 1280×597 campus image, gradient overlay, centered heading, and four 216px benefit cards.
- **Homepage Admissions Methods**: The six admission-method rows and full composition follow Figma nodes `341:13622` and `457:49664` with the 617px list, exact background treatment, exported ellipse vectors, and graduate cutout.
- **Homepage Registration**: The counseling form follows Figma node `204:16769` with the 1280×731 campus background, 535px form card, two-column fields, exported controls, and the right-side recruitment heading.
- **Global Footer**: The shared footer follows Figma node `185:9764` with its 1280×663 background and gradient, white brand mark, three information columns, hotline card, certification badges, social assets, and copyright rule.

## 2. Rendering & Caching Strategy

- **Incremental Static Regeneration (ISR)**: Public article and page routes use Next.js tag-based revalidation (`revalidateTag()`), serving static HTML at edge speed while refreshing instantly upon publication.
- **Published Snapshot Isolation**: The public website exclusively requests data from `/api/v1/public/*`, ensuring visitor traffic is completely isolated from live draft edits.
- **Localized Subpaths**: Routes are localized using path prefixes (`/vi/...` and `/en/...`) with language switcher controls in the global header.

## 3. SEO & Structured Data

- **Dynamic OpenGraph**: OpenGraph images, titles, and descriptions are dynamically generated from `content_translations` / `page_translations`.
- **JSON-LD Schema**: Embeds structured data for `EducationalOrganization`, `NewsArticle`, and `Event` to maximize search engine discoverability.
- **Automated Sitemaps**: `apps/web/src/app/sitemap.ts` and `robots.ts` generate crawlable search engine manifests matching published routes.
