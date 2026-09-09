# Operations: SEO & Redirects Management

## 1. Automated & Operational Redirects

TTU Platform manages URL equity and legacy path preservation through its database-backed redirection engine (`redirects` table):

- **Automated Slug Change Redirects**: When an editor updates a published content item's path, `ContentPublishingService` automatically writes a permanent `301` redirect from the old path to the new path inside the same database transaction.
- **Manual Operational Redirects**: Administrators can configure custom vanity paths or campaign URLs via the admin dashboard.
- **Collision Protection**: Enforced by partial unique indexes in PostgreSQL (`uq_redirects_active_locale_source` and `uq_redirects_active_global_source`), preventing duplicate or conflicting active redirect rules.

## 2. Canonical URLs & Crawl Governance

- **Canonical Paths**: Every indexable page and article declares a single canonical URL via metadata (`<link rel="canonical">`), stripping query parameters, preview flags, and tracking tags.
- **Robots Policies**:
  - Production `robots.txt` permits crawling across public routes while disallowing `/api/` and internal routes.
  - Staging environments enforce complete crawl exclusion (`noindex, nofollow`).
- **Dynamic Sitemaps**: `apps/web/src/app/sitemap.ts` generates fresh XML sitemaps dynamically querying active public routes.
