# Business Requirements & Scope

## 1. Context & Objectives

The `ttu-platform` project establishes an autonomous, structured, and modern digital platform for Tan Tao University. The system satisfies the following business objectives:

1. **Eliminate Legacy WordPress Vulnerabilities & Technical Debt**: Replace fragile PHP/WordPress code and unstructured generic tables (`wp_posts`, `wp_postmeta`) with a type-safe TypeScript stack and relational PostgreSQL schema.
2. **Editorial Autonomy Without Code Deployment**: Enable administrative staff and editorial teams to manage banners, articles, page sections, media, and navigation independently without requesting developer assistance.
3. **Strict Design System Governance**: Guarantee consistent university visual identity using a Controlled Component CMS built on Next.js 16 and Tailwind CSS 4, preventing arbitrary HTML/CSS injection.
4. **Independent Multilingual Publishing**: Provide native support for Vietnamese (`vi`) and English (`en`), enabling independent editorial workflows and publication schedules per locale.
5. **Audited Editorial Workflow**: Enforce a formal lifecycle: `Draft` → `Preview` → `Review` → `Publish` → `Immutable Revision` → `Rollback`.
6. **Centralized Asset Management**: Decouple binary assets from the relational database, utilizing MinIO object storage with localized metadata and alt text.
7. **SEO & URL Equity Preservation**: Implement strict 301 redirect management to preserve legacy search engine ranking and prevent broken links.

## 2. System Scope

### 2.1 In-Scope

- Public university portal at `ttu.edu.vn`.
- Editorial administration dashboard at `admin.ttu.edu.vn`.
- Centralized NestJS REST API at `api.ttu.edu.vn`.
- Controlled Component Page Builder for university landing pages.
- Structured content domains: News, Announcements, Press Releases, Articles, and Events.
- Centralized academic program directory for university-wide degrees.
- Media Library integrated with MinIO.
- Multilevel navigation menu management.
- SEO metadata and OpenGraph management.
- Automatic and operational 301 redirects.
- Role-Based Access Control (RBAC) integrated with Keycloak SSO.
- Migration pipeline from WordPress.

### 2.2 Out-of-Scope

- Individual faculty websites and departmental CMS (governed by `ttu-faculty-platform`).
- Student Information Systems (SIS) and Student Portals.
- Learning Management Systems (LMS / Canvas / Moodle).
- Human Resources (HR) and payroll systems.
- Identity provider and user password credential storage (governed by `ttu-identity`).

## 3. User Personas

| Persona | Authentication | Permissions & Responsibilities |
| :-- | :-- | :-- |
| **Public Visitor** | None (Anonymous) | Browses published university pages, news, announcements, academic programs, and events. Filters content and switches languages (`vi`/`en`). |
| **Content Editor** | Keycloak SSO | Creates and edits drafts for pages, articles, and events; uploads media; previews content in real components. Does not have publish privileges. |
| **Reviewer / Publisher** | Keycloak SSO | Reviews editorial submissions, requests modifications, approves content, executes publications, and restores historical revisions. |
| **CMS Administrator** | Keycloak SSO | Manages page layouts, navigation menus, categories, tags, media assets, redirect rules, and general site settings. |
| **Super Administrator** | Keycloak SSO | Full system privileges: assigns administrative roles, inspects audit trails, bootstraps system configuration. Bound strictly by design system rules (cannot inject raw code). |

## 4. Core Business Rules (BR-01 – BR-10)

| Rule ID | Statement | Enforcement Layer |
| :-- | :-- | :-- |
| **BR-01** | `ttu-platform` exclusively manages main university digital assets; faculty portals remain strictly within `ttu-faculty-platform`. | API Domain Boundaries & Architecture |
| **BR-02** | Administrators and editors may only compose pages using components registered in the Component Registry. | API Schema Validation & Admin Inspector |
| **BR-03** | Injection of raw HTML, custom JavaScript, or direct CSS classes into content or page builder components is strictly prohibited. | API Validation Pipes & Sanitizers |
| **BR-04** | Multilingual content must not duplicate language-agnostic configurations, styles, media IDs, or component types. | Database Schema (`entity` vs `entity_translations`) |
| **BR-05** | Dynamic components (e.g. NewsGrid, EventList) store only query parameters; they never duplicate domain content records. | Component Registry & API Runtime |
| **BR-06** | Draft edits and unpublished revisions must never alter what public visitors observe on `ttu.edu.vn`. | Public API Inner Join on `published_revision_id` |
| **BR-07** | Every publication action creates an immutable revision snapshot per locale, ensuring reliable audit and instant rollback. | PostgreSQL `page_revisions` & `content_revisions` |
| **BR-08** | Binary files and documents must be stored in MinIO object storage, never inside the PostgreSQL database. | Media API & Storage Architecture |
| **BR-09** | User credentials and passwords reside exclusively in Keycloak; `ttu_main` stores only identity subject mappings (`sub`). | Identity Architecture & `users` Table |
| **BR-10** | Legacy WordPress data serves strictly as a migration source; target schema design remains 100% normalized and domain-driven. | Migration Pipeline Architecture |
