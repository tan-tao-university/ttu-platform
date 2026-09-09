# Database: Physical Schema & Conventions

## 1. Schema Conventions

The physical PostgreSQL schema implemented in `apps/api/src/db/schema.ts` follows strict engineering standards:

- **Primary Keys**: Every primary entity uses a `UUID` primary key generated via `gen_random_uuid()` (backed by `defaultRandom()` in Drizzle ORM).
- **Timestamps**: All business dates and timestamps use `timestamptz` (`timestamp({ withTimezone: true })`), never naive timestamps.
- **Status & Enums**: Enums are implemented as `varchar` columns typed with Drizzle `$type<T>()` and enforced by Postgres `CHECK` constraints (e.g. `check('status_check', sql'status IN (...)')`), avoiding complex migration rituals required by native Postgres `ENUM` types.
- **Translatable Entities**: Structured as `entity` + `entity_translations` with a composite primary key `(entity_id, locale)` to enforce localized uniqueness.

## 2. Indexing Strategy

- **Public Feed Optimization**: Partial indexes index published content ordered by release date:
  ```sql
  CREATE INDEX idx_content_translation_public_feed
  ON content_translations (locale, published_at DESC)
  WHERE status = 'PUBLISHED';
  ```
- **Automated Schedulers**:
  ```sql
  CREATE INDEX idx_content_translation_scheduler
  ON content_translations (scheduled_at)
  WHERE status = 'SCHEDULED';
  ```
- **Active Route Uniqueness**: Redirects enforce collision protection using partial unique indexes:
  ```sql
  CREATE UNIQUE INDEX uq_redirects_active_locale_source
  ON redirects (locale, source_path)
  WHERE is_active = TRUE AND locale IS NOT NULL;
  ```
- **Audit Logging**: Composite indices accelerate filtering by actor and entity over time:
  ```sql
  CREATE INDEX idx_audit_actor_time ON audit_logs (actor_user_id, occurred_at DESC);
  CREATE INDEX idx_audit_entity_time ON audit_logs (entity_type, entity_id, occurred_at DESC);
  ```
