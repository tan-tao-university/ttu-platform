# Setup & running

## Requirements

- Node 24 (`nvm use`)
- Bun + Moon (via proto — see `.prototools`)
- A sibling checkout of [ttu-data-infra](../../ttu-data-infra), running (`bun run infra:up` from the root of this repo, or `make dev-up` in that repo) with `ttu_main` bootstrapped — `apps/api` connects to it (see Database below).
- A sibling checkout of [ttu-identity](../../ttu-identity), running (`bun run dev` in that repo) with its `ttu` realm imported — `apps/api` verifies every Admin API request against it (see Identity & Authorization below). Not required just to boot `apps/api`; only to call an authenticated route.

## Local development

```bash
bun install
bun run dev            # every app in parallel
bun run dev:web        # public site (:3000)
bun run dev:admin      # admin dashboard (:3011)
bun run dev:api        # API (:4001)
```

`apps/web` and `apps/admin` need no `.env` yet — neither calls the API. `apps/api` requires `apps/api/.env` (copy `apps/api/.env.example`); see Database below.

## Database

`apps/api` connects to `ttu-data-infra`'s `ttu_main` PostgreSQL database via [Drizzle ORM](https://orm.drizzle.team), the same pattern `ttu-faculty-platform/apps/api` uses against `ttu_faculty`. Schema source of truth is `apps/api/src/db/schema.ts`, generated migrations live in `apps/api/drizzle/`.

```bash
bun run infra:up                  # starts ttu-data-infra's Postgres + MinIO and bootstraps ttu_main
cp apps/api/.env.example apps/api/.env   # DATABASE_URL already points at the dev ttu_main
cd apps/api
bun run db:migrate                # applies every migration in drizzle/ to ttu_main
bun run db:studio                 # optional — browse ttu_main in Drizzle Studio
```

`bun run db:generate` regenerates a migration after changing `schema.ts`. A handful of constraints Drizzle's schema builder cannot express yet (composite-column `DEFERRABLE`) are hand-written custom migrations — see `apps/api/drizzle/0001_page_sections_deferrable_order.sql` for the pattern before adding another one.

## Identity & Authorization

`apps/api` verifies Admin API requests against `ttu-identity`'s Keycloak realm (`ttu`) — signature, issuer, expiry, and the `ttu-web` client the token must have been issued for — then resolves CMS permissions from `ttu_main`'s own `roles`/`permissions` tables, never from the token itself (design doc 07). See `apps/api/src/access/`.

```bash
cd apps/api
bun run db:seed                                            # permission catalog + the 5 named roles
bun run db:create-super-admin -- --sub <keycloak-sub> --email you@ttu.edu.vn --name "You"
```

`--sub` is the target account's Keycloak `sub` claim (Keycloak Admin Console → Users → the account → ID) — the account must already exist in `ttu-identity`; this script only creates the local `ttu_main` mapping and grants `super_admin`. `db:seed` grants `super_admin` every permission in the catalog; the other 4 roles (`cms_admin`, `editor`, `reviewer`, `publisher`) are seeded with zero grants — assign them explicitly once there is an admin surface for it (see `apps/api/src/db/seed.ts`'s comment for why).

Every other account gets a `users` row automatically (JIT-provisioned, no role) the first time it calls an authenticated route — `GET /api/v1/admin/me` is the one to try first; it returns the caller's identity and effective permission list.

## Content & Taxonomy API

`apps/api/src/content/` and `apps/api/src/taxonomy/` implement the Content domain (news, announcements, press releases, research articles, events) and its categories/tags — design docs 05 §8-9, 06 §5, §10. **Not** the CMS Page Builder domain (`pages`/`page_sections`): that depends on a Component Registry (`packages/cms-registry`) that does not exist yet — see AGENTS.md.

```plain text
POST   /api/v1/admin/content                               create (type only; NEWS/ANNOUNCEMENT/PRESS_RELEASE/RESEARCH_ARTICLE/EVENT)
GET    /api/v1/admin/content?locale=vi                      list drafts (locale required)
GET    /api/v1/admin/content/:id                            item + every locale's translation + event + assignments
PATCH  /api/v1/admin/content/:id                             featuredMediaId only — type is immutable after creation
DELETE /api/v1/admin/content/:id                             soft delete
POST   /api/v1/admin/content/:id/translations/:locale        upsert draft translation (title/body/seo/...)
POST   /api/v1/admin/content/:id/event                       upsert event details — only valid when type = EVENT
POST   /api/v1/admin/content/:id/locales/:locale/publish     validate, snapshot, publish, sync public_routes + redirects — one transaction
GET    /api/v1/admin/content/:id/locales/:locale/revisions   immutable publish history for this locale
POST   /api/v1/admin/content/:id/locales/:locale/restore/:revisionId   copy a past revision back onto the draft (doc 06 §11 — never republishes automatically)
POST/DELETE /api/v1/admin/content/:id/categories, /tags      taxonomy assignment

GET    /api/v1/public/content?locale=vi                      published only, reads the published revision snapshot — never the live draft
GET    /api/v1/public/content/:slug?locale=vi                 same; slug is matched against the published snapshot's slug, not the draft's

/api/v1/admin/categories, /api/v1/admin/tags                  full CRUD + per-locale translations
```

Gated by `content.read`/`content.create`/`content.edit`/`content.delete`/`content.publish`/ `content.restore` (categories/tags reuse `content.read`/`content.edit` — no dedicated `taxonomy.*` permission exists in the catalog). `bun run db:seed` must have run first (locales, permission catalog) — see Identity & Authorization above.

## Checks

```bash
bun run format:check                       # oxfmt formatting validation
bun run lint                               # oxlint + ESLint
bun run duplication                        # jscpd copy-paste detection
bun run knip                               # dead-code & unused dependency detector
moon run :typecheck && moon run :build     # typecheck and production build
moon run api:test                          # NestJS unit tests (Jest)
```

## Production

`compose.production.yml` builds all three apps as containers and joins the shared `ttu-backend` Docker network that `ttu-data-infra` owns. It does not start Postgres, MinIO, or Keycloak — those are the sibling repos' job, and must be running first.

```
env/production/
  api.env     # apps/api runtime config — NODE_ENV, PORT, CORS_ORIGINS, DATABASE_URL, DB_POOL_*, KEYCLOAK_*
  site.env    # shared by web + admin — currently unused, kept for parity with ttu-faculty-platform
```

Real env files are never committed — only `apps/*/.env.example` is checked in.

## Branch protection & release flow

`main` and `prod` are meant to be PR-only (CI required, no direct pushes, not even for admins). See [branch-protection.md](branch-protection.md) for the target workflow, the GitHub-plan prerequisite currently blocking it, and the exact commands to apply once unblocked.

## Next steps (tracked outside this repo)

1. ~~Design the ERD for ttu.edu.vn's content~~ — done; see [content-audit.md](content-audit.md) for what the current WordPress site actually contains, and the project's Notion workspace for the ERD and physical schema that came out of it.
2. ~~Wire `apps/api` to `ttu-data-infra`'s `ttu_main` database~~ — done (Drizzle ORM, the same pattern `ttu-faculty-platform/apps/api` uses against `ttu_faculty`); see Database above.
3. Add the `ttu-web` client to `ttu-identity`'s realm and wire `apps/admin`'s sign-in against it, the same OIDC Authorization Code + PKCE flow `ttu-faculty-platform/apps/admin` uses against `faculty-admin`.
   - ~~`apps/api` verifies Keycloak-issued tokens and enforces CMS RBAC~~ — done; see Identity & Authorization above.
   - `apps/admin`'s actual sign-in UI (the Authorization Code + PKCE redirect flow against the `ttu-web` client) is still open — nothing in `apps/admin` calls the API yet.
4. ~~Add content modules and DTOs to `apps/api`~~ — done for the Content domain (news, announcements, events, ...) and its taxonomy; see Content & Taxonomy API above.
5. Media/storage endpoints (doc 08) — not started; needs MinIO wiring (`S3_*` env, upload validation).
6. CMS Page Builder (`pages`/`page_sections`, doc 02-03) — blocked on a Component Registry (`packages/cms-registry`) and a real component set, neither of which exist yet. Do not add `pages`/`page_sections` endpoints or invent components to unblock this speculatively — see AGENTS.md.
