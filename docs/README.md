# TTU Platform — Master Documentation Index

Welcome to the technical documentation for **TTU Platform** (`ttu-platform`), the unified digital platform for Tan Tao University.

---

## Documentation Directory Map

### 1. Overview & Business Requirements

- [**System Overview**](overview/system-overview.md): Platform architecture, monorepo layout, sibling repositories, and system boundaries.
- [**Business Requirements**](overview/business-requirements.md): Scope, user personas, editorial workflows, core business rules (BR-01–BR-10), and acceptance criteria.
- [**WordPress Content Audit**](content-audit.md): Historical snapshot of the legacy WordPress website and post taxonomy audit.

### 2. Architecture & Design Systems

- [**Modular Monolith Architecture**](architecture/modular-monolith.md): Domain module boundaries, layer responsibilities, and ADR-TTU-002 decision.
- [**CMS & Page Builder Architecture**](architecture/cms-page-builder.md): Controlled Component CMS, Page → Section → Component model, data zones, and per-locale publishing.
- [**Component Registry & Design Tokens**](architecture/component-registry.md): `@ttu/cms-registry` package contract, Level A safe style controls, and the initial 18-component catalog.

### 3. Database & Persistence

- [**Entity Relationship Diagram (ERD)**](database/erd.md): Complete logical ERD covering all 36 tables across 8 domains.
- [**Physical Schema & Conventions**](database/schema.md): UUID primary keys, timestamp rules, check-constrained status enums, and partial index optimizations.
- [**Migration Strategy**](database/migration-strategy.md): Drizzle ORM generation, migration lifecycle, and zero-downtime expand-contract patterns.

### 4. Identity, SSO & Access Control

- [**Authentication & SSO**](identity/authentication.md): Keycloak OIDC Authorization Code Flow with PKCE, JWT verification, and JIT provisioning.
- [**Authorization & RBAC**](identity/authorization.md): Permissions catalog, administrative roles, server-side guard enforcement, and super admin bootstrap.

### 5. Media & Asset Management

- [**Media Storage & Pipeline**](media/storage-and-pipeline.md): MinIO S3 object storage, upload validation, size policies, and localized alt text.

### 6. Backend API

- [**API Conventions & Standards**](api/conventions.md): REST namespaces (`/public/`, `/admin/`), ProblemDetails error envelopes, and pagination standards.
- [**Endpoints Catalog**](api/endpoints.md): Full inventory of Public and Admin endpoints across Content, Taxonomy, and Identity.
- [**Publishing Workflow**](api/publishing-workflow.md): Multi-step atomic publication transaction, snapshot immutability, 301 route syncing, and revision rollback.

### 7. Frontend Applications

- [**Admin Dashboard**](frontend/admin-dashboard.md): Next.js 16 admin shell, OIDC login, editorial views, and permission gating.
- [**Public Website**](frontend/public-website.md): Next.js 16 public portal, published snapshot isolation, ISR caching, and SEO structured data.

### 8. Operations & Migration

- [**Setup & Development**](setup.md): Local environment setup, dependencies, database seeding, and testing commands.
- [**Production Deployment**](operations/deployment.md): Host Nginx reverse proxy, Docker Compose topology, and CI/CD pipelines.
- [**SEO & Redirects Management**](operations/seo-and-redirects.md): URL redirect engine, canonical URLs, and sitemaps.
- [**WordPress Migration Pipeline**](operations/wordpress-migration.md): 7-stage migration pipeline from legacy WordPress to TTU Platform.
- [**Branch Protection Rules**](branch-protection.md): GitHub branch protection policies and required status checks.

### 9. Diagrams & Visual Assets

- [**Diagram Assets Gallery**](assets/): Mermaid diagram sources (`.mmd`), high-resolution rendered graphics (`.png`), and the automated rendering script (`render.sh`).
