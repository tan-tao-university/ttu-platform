# TTU Platform — Agent Guide

`ttu-platform` replaces the WordPress site at ttu.edu.vn: the public website (`apps/web`), its
content admin dashboard (`apps/admin`), and the API behind both (`apps/api`). It is a sibling
repo to [ttu-data-infra](https://github.com/tan-tao-university/ttu-data-infra) (shared
Postgres + MinIO) and [ttu-identity](https://github.com/tan-tao-university/ttu-identity)
(Keycloak SSO); [ttu-faculty-platform](https://github.com/tan-tao-university/ttu-faculty-platform) is the separate repo hosting the 7 faculty sites and is not
touched from here.

## Do not build ahead of the ERD

This repo is intentionally a scaffold: toolchain, monorepo layout, three apps that boot and
serve a placeholder page. **`apps/api` has no database connection, schema, auth guard, or
storage integration** — see root [README.md](README.md) Status and
[docs/content-audit.md](docs/content-audit.md). Do not add Drizzle, a schema, DTOs, a Keycloak
guard, or an S3 client speculatively. Wait for an explicit content/data model decision, then
follow [docs/setup.md](docs/setup.md)'s "Next steps".

## Toolchain & stack

Bun 1.4.0 + Moon 2.5.3 (via `.prototools`/proto). Next.js 16 + React 19 + Tailwind 4 for
`web`/`admin`. NestJS 11 for `api`. Oxfmt (format), Oxlint + ESLint (lint), Knip (dead code),
JSCPD (duplication), Lefthook + Commitlint (git hooks, Conventional Commits).

## Workflow

Stay on and commit to the branch the user is currently working on. Never switch to `main`
without being asked.

- **Small changes** (typo fixes, config tweaks, doc updates): commit directly to the current
  branch.
- **Non-trivial changes** (new app surface, dependency between apps, anything touching more
  than one file's worth of behavior): branch as `<type>/<kebab-case-slug>` from the current
  base branch, `type` one of `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`,
  `style`, `ci`, `build`, `revert` — matching `commitlint.config.mjs`'s `type-enum`. Push once
  there is a commit worth seeing.
- Delete a merged temporary branch immediately, locally and on remote. Never delete `main`.

## Documentation

A code change updates the matching doc on the same branch. [docs/setup.md](docs/setup.md)
covers running and checks; [docs/content-audit.md](docs/content-audit.md) is a snapshot of the
WordPress site being replaced, not a spec — update it if the live site's structure changes
before the ERD work starts, but do not turn it into the ERD itself.

## Writing

Committed files are English-only, except user-facing product copy in `apps/web`/`apps/admin`,
which is Vietnamese-first (the site's actual audience).

**Never hard-wrap markdown prose.** One paragraph or list item is one line, however long; let
the editor soft-wrap it. Run `bun run format` after editing markdown — `oxfmt` formats it too.

## Quality gates & verification

Run before finishing any task, opening a PR, or creating a commit:

```bash
bun run format:check                        # oxfmt formatting validation
bun run lint                                # oxlint + ESLint
bun run duplication                         # jscpd copy-paste detection
bun run knip                                # dead-code & unused dependency detector
moon run :typecheck                         # TypeScript across all 3 projects
moon run api:test                           # NestJS unit tests (Jest)
moon run :build                             # build all three apps
```
