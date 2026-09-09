# Architecture: Modular Monolith

## 1. Architectural Decision (ADR-TTU-002)

Backend API (`apps/api`) is structured as a **Modular Monolith**.

Rather than splitting the backend into premature microservices with distributed transaction complexity, all core domains are colocated within a single NestJS application. Domain boundaries are enforced through strict module isolation, clean service interfaces, and controlled repository queries.

## 2. Domain Modules

The codebase is organized into discrete business domain modules under `apps/api/src/`:

```plain text
apps/api/src/
├── access/         # Keycloak JWT verification, local RBAC, user identity mapping
├── content/        # Articles, news, announcements, events, translations, revisions, publishing
├── taxonomy/       # Hierarchical categories, flat tags, and content assignments
├── media/          # MinIO object operations, asset metadata, localized captions
├── university/     # Academic programs, institutional leadership profiles, corporate partners
├── navigation/     # Menus, hierarchical menu items, multilingual route labels
├── redirects/      # 301/302 URL redirect resolution and collision prevention
├── settings/       # University global operational settings and metadata
└── common/         # Shared HTTP filters, error envelopes, and database utilities
```

## 3. Internal Layer Boundaries

Within each domain module, code adheres to a strict unidirectional dependency rule:

```plain text
HTTP Controller (Presentation Layer)
       ↓
Application Service (Business Logic & Transactions)
       ↓
Domain Rules & Validation Schemas
       ↓
Repository & Drizzle ORM (Persistence Layer)
```

### Invariants:

- Controllers never execute raw SQL or handle complex database transactions directly.
- Modules never query another module's database tables directly; cross-domain coordination occurs via injected NestJS services.
- Multi-table operations that require atomicity (such as publishing a revision and updating route redirects) are orchestrated within an explicit database transaction block in the service layer.
