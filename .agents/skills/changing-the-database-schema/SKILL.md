---
name: changing-the-database-schema
description: Use when adding, altering, or dropping a database table, column, index, relation, or constraint in apps/api (ttu_main), or when generating, reviewing, or applying Drizzle migrations.
---

# Changing the Database Schema

## Overview

`ttu-platform` uses **PostgreSQL 16** with **Drizzle ORM** against the `ttu_main` database. Prisma was explicitly rejected — never propose `schema.prisma`, a generated Prisma client, or `prisma migrate`.

## Where Things Live

| Path | Purpose |
| :-- | :-- |
| `apps/api/src/db/schema.ts` | Complete physical schema definitions (36 tables). The **only** schema file edited by hand. |
| `apps/api/drizzle/*.sql` | Generated migration scripts. **Never hand-edit.** |
| `apps/api/drizzle/meta/` | Drizzle migration sequence journal (`_journal.json`) and schema snapshots. |
| `apps/api/drizzle.config.ts` | Drizzle Kit configuration (PostgreSQL dialect, schema path, output directory). |
| `apps/api/src/db/index.ts` | Postgres client pool connection and typed Drizzle `db` instance. |

## The Migration Loop

```bash
# 1. Edit apps/api/src/db/schema.ts

# 2. Generate migration SQL by diffing schema against historical snapshot (offline)
bun run --cwd apps/api db:generate

# 3. CRITICAL: Review the generated SQL file in apps/api/drizzle/ before applying!

# 4. Apply pending migrations to the local database
bun run --cwd apps/api db:migrate
```

`db:generate` runs **offline** without connecting to PostgreSQL; it diffs TypeScript schema AST against the latest snapshot in `apps/api/drizzle/meta/`. Only `db:migrate`, `db:seed`, and `db:studio` require a live database.

## Architecture & Schema Invariants

- **Always Read Generated SQL**: Renaming a column often produces `DROP COLUMN` + `ADD COLUMN`, which silently causes data loss. If destructive SQL is generated for a rename, fix the schema definition and regenerate.
- **UUID Primary Keys**: Every entity uses a UUID PK (`uuid('id').primaryKey().defaultRandom()`).
- **Timestamps with Timezone**: All timestamps use `timestamp('...', { withTimezone: true })`.
- **String Enums with Check Constraints**: Enums use `varchar` with Drizzle `$type<...>()` and an explicit Postgres `check(...)` constraint (e.g. `check('status_check', sql'status IN (...)')`). Do not use native Postgres `pgEnum`.
- **Translatable Entity Pattern**: Translatable entities separate core identity from localization: `entity` + `entity_translations` with a composite primary key `(entity_id, locale)`.
- **Zero Faculty Scoping**: `ttu_main` **never** contains `faculty_id` or `organization_unit_id` columns. All faculty-specific data belongs to `ttu-faculty-platform`.
- **Never Use `drizzle-kit push` in Production**: Direct schema pushing bypasses migration history.
- **Infer Types Directly**: Always infer types via `typeof table.$inferSelect` and `typeof table.$inferInsert`. Never hand-author redundant interfaces.

## Mandatory Documentation Updates

A database schema change is **never docs-optional**. When modifying `schema.ts`:

1. Update [docs/database/schema.md](../../../docs/database/schema.md) (column types, indexes, check constraints).
2. Update [docs/database/erd.md](../../../docs/database/erd.md) and the Mermaid diagram in [docs/assets/database-erd-overview.mmd](../../../docs/assets/database-erd-overview.mmd).
3. Re-render the diagram graphic:
   ```bash
   bun run docs:render-diagrams
   ```
4. Update the table counts and lists in [apps/api/IMPLEMENTATION_STATUS.md](../../../apps/api/IMPLEMENTATION_STATUS.md) and the root [IMPLEMENTATION_STATUS.md](../../../IMPLEMENTATION_STATUS.md).
5. Add an entry to [CHANGELOG.md](../../../CHANGELOG.md).

## Verification

After applying migrations:

1. `moon run api:typecheck` to detect call sites broken by the schema change.
2. `moon run api:test` to verify repository and service specs.
3. Run the full verification pass: `verifying-monorepo-changes`.
