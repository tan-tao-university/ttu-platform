# Database: Migration Strategy

## 1. Drizzle Kit Lifecycle

Database migrations are managed using **Drizzle ORM** and **Drizzle Kit**. Migrations are generated offline by diffing the TypeScript schema against historical snapshots:

```sh
# Generate a new SQL migration from schema diff
bun run --cwd apps/api db:generate

# Apply pending migrations to the database
bun run --cwd apps/api db:migrate
```

## 2. Migration Directory Structure

Migrations reside in `apps/api/drizzle/`:

```plain text
apps/api/drizzle/
├── 0000_bouncy_carmella_unuscione.sql           # Initial 36-table physical schema
├── 0001_page_sections_deferrable_order.sql      # Deferrable sort order constraint
├── 0002_database_schema_alignment.sql           # Canonical table renames & index optimizations
└── meta/
    ├── _journal.json                            # Drizzle migration sequence journal
    ├── 0000_snapshot.json
    ├── 0001_snapshot.json
    └── 0002_snapshot.json
```

## 3. Production Migration Rules

- **Zero Downtime Pattern**: Breaking changes use the expand-contract pattern:
  1. Add new column with a default or nullable constraint.
  2. Deploy application code that writes to both old and new columns.
  3. Backfill existing records.
  4. Deploy code reading exclusively from the new column.
  5. Drop the obsolete column in a subsequent release.
- **Never Run `drizzle-kit push` in Production**: Schema modifications must be reviewed as explicit SQL files in pull requests.
