# Claude Code Guidelines: TTU Platform

This repository replaces the WordPress site at ttu.edu.vn with a public website
(`apps/web`), a content admin dashboard (`apps/admin`), and the API behind both
(`apps/api`). See [AGENTS.md](AGENTS.md) for the full guide — this file is the same
content, kept for tools that read `CLAUDE.md` specifically.

## Toolchain & Stack

- **Package Manager & Task Runner**: Bun 1.4.0 + Moon 2.5.3 (via `.prototools`/proto).
- **Frontend Applications**: Next.js 16 (App Router) + React 19 + Tailwind CSS 4.
- **Backend API**: NestJS 11 (Node 24 LTS) — bare bootstrap only, no database yet.
- **Linters & Formatters**: Oxfmt, Oxlint + ESLint, Knip, JSCPD, Lefthook, Commitlint.
- **Testing**: Jest for `apps/api`.

## Do not build ahead of the ERD

`apps/api` has no database, schema, auth, or storage wiring on purpose — the content model for
ttu.edu.vn has not been designed yet (see [docs/content-audit.md](docs/content-audit.md) for
what the current WordPress site holds). Do not add Drizzle, tables, DTOs, a Keycloak guard, or
an S3 client speculatively; see [docs/setup.md](docs/setup.md)'s "Next steps" for the actual
order of work once that design exists.

## Core Commands

```bash
bun install
bun run dev                                 # every app in parallel
bun run dev:web                             # public site (:3000)
bun run dev:admin                           # admin dashboard (:3011)
bun run dev:api                             # backend API (:4001)
```

### Quality & Verification (required before commit / PR)

```bash
bun run format:check                        # oxfmt format check
bun run lint                                # oxlint + ESLint check
bun run duplication                         # jscpd code copy-paste detection
bun run knip                                # dead code & unused dependency detector
moon run :typecheck                         # TypeScript across all 3 projects
moon run api:test                           # NestJS unit tests (Jest)
moon run :build                             # build all three apps
```

## Critical Rules

1. **Branching & Commits**: stay on the current branch; only branch for non-trivial changes as
   `<type>/<kebab-case-slug>`; Conventional Commits enforced by `commitlint` + `lefthook`.
2. **Documentation**: update `docs/` alongside any code change; never hard-wrap markdown
   prose; committed files are English-only except Vietnamese-first product copy in
   `apps/web`/`apps/admin`.
3. **No speculative infrastructure**: no database, auth, or storage code in `apps/api` until
   the ERD and auth flow are explicitly decided — see Status in [README.md](README.md).
