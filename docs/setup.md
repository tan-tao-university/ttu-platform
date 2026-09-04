# Setup & running

## Requirements

- Node 24 (`nvm use`)
- Bun + Moon (via proto — see `.prototools`)
- A sibling checkout of [ttu-data-infra](../../ttu-data-infra) and
  [ttu-identity](../../ttu-identity) for when `apps/api` starts talking to them (not yet — see
  root [README.md](../README.md) Status)

## Local development

```bash
bun install
bun run dev            # every app in parallel
bun run dev:web        # public site (:3000)
bun run dev:admin      # admin dashboard (:3011)
bun run dev:api        # API (:4001)
```

No `.env` is required to run any of the three apps today — `apps/api` reads only `PORT` and
`CORS_ORIGINS`, both optional, and neither `web` nor `admin` calls the API yet.

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

`compose.production.yml` builds all three apps as containers and joins the shared
`ttu-backend` Docker network that `ttu-data-infra` owns. It does not start Postgres, MinIO, or
Keycloak — those are the sibling repos' job, and must be running first.

```
env/production/
  api.env     # apps/api runtime config — currently just NODE_ENV, PORT, CORS_ORIGINS
  site.env    # shared by web + admin — currently unused, kept for parity with ttu-web-platform
```

Real env files are never committed — only `apps/*/.env.example` is checked in.

## Next steps (tracked outside this repo)

1. Design the ERD for ttu.edu.vn's content — see [content-audit.md](content-audit.md) for what
   the current WordPress site actually contains.
2. Once designed, wire `apps/api` to `ttu-data-infra`'s `ttu_main` database (Drizzle ORM, the
   same pattern `ttu-web-platform/apps/api` uses against `faculty_ttu`).
3. Add the `ttu-web` client to `ttu-identity`'s realm and wire `apps/admin`'s sign-in against
   it, the same OIDC Authorization Code + PKCE flow `ttu-web-platform/apps/admin` uses against
   `faculty-admin`.
4. Only then add content modules, DTOs, and media/storage endpoints to `apps/api`.
