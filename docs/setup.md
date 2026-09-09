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

`--sub` is the target account's Keycloak `sub` claim (Keycloak Admin Console → Users → the account → ID) — the account must already exist in `ttu-identity`; this script only creates the local `ttu_main` mapping and grants `super_admin`. `db:seed` grants every role an explicit permission set (`super_admin` gets everything; `cms_admin`/`editor`/`reviewer`/`publisher` get the scoped grants in `apps/api/src/db/role-permissions.catalog.ts`, justified against design doc 07 §10 — see `docs/identity/authorization.md` §3 for the resulting matrix).

Every other account gets a `users` row automatically (JIT-provisioned, no role) the first time it calls an authenticated route — `GET /api/v1/admin/me` is the one to try first; it returns the caller's identity and effective permission list.

## Admin OIDC Sign-In

`apps/admin` implements the browser-side login as a server-side (BFF) Authorization Code + PKCE flow against the same `ttu-identity` realm/client — `apps/admin/src/lib/auth/`, `apps/admin/src/app/api/auth/`, `apps/admin/src/proxy.ts`. See `docs/identity/authentication.md` §2 for the flow itself.

`.env.local` needs (already in `.env.example`):

```plain text
KEYCLOAK_ISSUER_URL=http://localhost:8080/realms/ttu
KEYCLOAK_CLIENT_ID=ttu-web
APP_BASE_URL=http://localhost:3011       # must match a redirect URI ttu-identity's ttu-web client allowlists
SESSION_SECRET=<openssl rand -base64 32> # high-entropy; encrypts the session cookie — never reuse the .env.example placeholder
```

```bash
bun run dev:api      # apps/admin's callback calls GET /api/v1/admin/me
bun run dev:admin
```

Visiting any page redirects to Keycloak; sign in with an account that exists in `ttu-identity`'s `ttu` realm. `apps/admin`'s home page renders the authenticated identity, active status, and effective permission list from `GET /api/v1/admin/me` — a freshly JIT-provisioned account with no role assignment will show an empty permission list, which is correct (see Identity & Authorization above).

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

## Media / MinIO API

`apps/api/src/media/` implements the Media domain (design doc 08) against `ttu-data-infra`'s MinIO instance.

```bash
bun run infra:up   # also provisions the ttu-media bucket + scoped app-readwrite MinIO credential
```

`.env` needs 4 more variables on top of the ones above (already in `.env.example`):

```plain text
S3_ENDPOINT=http://127.0.0.1:9000
S3_BUCKET=ttu-media
S3_ACCESS_KEY=ttu-app       # ttu-data-infra's MINIO_APP_ACCESS_KEY, never MINIO_ROOT_USER
S3_SECRET_KEY=ttu_app_dev_secret
```

```plain text
GET    /api/v1/admin/media                                   list, optional mimeType/search filters
GET    /api/v1/admin/media/:id                                metadata + resolved delivery URL + translations
POST   /api/v1/admin/media                                    multipart file upload (field name: file)
PUT    /api/v1/admin/media/:id/translations/:locale           upsert alt text / caption
DELETE /api/v1/admin/media/:id                                soft delete — 409 if referenced by published content or an active person/partner
POST   /api/v1/admin/media/:id/restore                        undo a soft delete
```

Gated by `media.read`/`media.upload`/`media.update`/`media.delete`. Allowlist: `image/jpeg`, `image/png`, `image/webp` (≤10 MB), `application/pdf` (≤50 MB) — validated by size, declared MIME type, and magic-byte signature, not by filename extension. `ttu-media` is a public, anonymous-download bucket (`ttu-data-infra`'s `minio/init/create-buckets.sh`), so delivery URLs are plain and unsigned, not presigned.

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
3. ~~Add the `ttu-web` client to `ttu-identity`'s realm and wire `apps/admin`'s sign-in against it~~ — done (server-side Authorization Code + PKCE flow, encrypted `HttpOnly` session cookie, automatic refresh); see Admin OIDC Sign-In above.
   - ~~`apps/api` verifies Keycloak-issued tokens and enforces CMS RBAC~~ — done; see Identity & Authorization above.
   - ~~`apps/admin`'s actual sign-in UI~~ — done; see Admin OIDC Sign-In above.
4. ~~Add content modules and DTOs to `apps/api`~~ — done for the Content domain (news, announcements, events, ...) and its taxonomy; see Content & Taxonomy API above.
5. ~~Media/storage endpoints (doc 08)~~ — done (MinIO wiring, upload validation, delete-reference protection); see Media / MinIO API above.
6. CMS Page Builder (`pages`/`page_sections`, doc 02-03) — blocked on a Component Registry (`packages/cms-registry`) and a real component set, neither of which exist yet. Do not add `pages`/`page_sections` endpoints or invent components to unblock this speculatively — see AGENTS.md.
