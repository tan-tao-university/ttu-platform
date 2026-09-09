# TTU Platform — Agent Guide

`ttu-platform` replaces the WordPress site at ttu.edu.vn: the public website (`apps/web`), its content admin dashboard (`apps/admin`), and the API behind both (`apps/api`). It is a sibling repo to [ttu-data-infra](https://github.com/tan-tao-university/ttu-data-infra) (shared Postgres + MinIO) and [ttu-identity](https://github.com/tan-tao-university/ttu-identity) (Keycloak SSO); [ttu-faculty-platform](https://github.com/tan-tao-university/ttu-faculty-platform) is the separate repo hosting the 7 faculty sites and is not touched from here.

## Do not build ahead of the wiring order

`apps/api` has a database connection, a Keycloak auth guard (`src/access/`), and its first business domain, Content (`src/content/`, `src/taxonomy/`) — see root [README.md](README.md) Status and [docs/setup.md](docs/setup.md#content--taxonomy-api). It still has **no storage integration and no CMS Page Builder domain**.

- Do not add an S3/MinIO client speculatively — wire it when a real upload endpoint needs it (doc 08).
- Do not add `pages`/`page_sections` endpoints, and do not invent components/schemas to unblock them: the CMS Page Builder domain (doc 02-03) depends on a Component Registry (`packages/cms-registry`) and a real ~15-20-component set that don't exist in this repo yet — that is real product/design work, not something to fabricate to fill the gap.
- `apps/admin`'s actual sign-in UI (the browser-side OIDC redirect against `ttu-web`) is still open — nothing in `apps/admin` calls the API yet.

## Toolchain & stack

Bun 1.4.0 + Moon 2.5.3 (via `.prototools`/proto). Next.js 16 + React 19 + Tailwind 4 for `web`/`admin`. NestJS 11 for `api`. Oxfmt (format), Oxlint + ESLint (lint), Knip (dead code), JSCPD (duplication), Lefthook + Commitlint (git hooks, Conventional Commits).

## Workflow

Stay on and commit to the branch the user is currently working on. Never switch to `main` without being asked.

- **Small changes** (typo fixes, config tweaks, doc updates): commit directly to the current branch.
- **Non-trivial changes** (new app surface, dependency between apps, anything touching more than one file's worth of behavior): branch as `<type>/<kebab-case-slug>` from the current base branch, `type` one of `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `style`, `ci`, `build`, `revert` — matching `commitlint.config.mjs`'s `type-enum`. Push once there is a commit worth seeing.
- Delete a merged temporary branch immediately, locally and on remote. Never delete `main`.

## Documentation & Continuous Documentation Rule

A code change updates the matching doc on the same branch. [docs/setup.md](docs/setup.md) covers running and checks; [docs/README.md](docs/README.md) is the master documentation index.

**Continuous Documentation Rule for AI Agents**:

- Whenever updating or adding code (features, endpoints, models, architecture, components), you MUST simultaneously update the relevant documentation files under `docs/`.
- If a feature, API route, or architectural capability exists in the codebase but lacks documentation in `docs/`, you MUST create a new documentation file in the appropriate `docs/` subfolder (`overview/`, `architecture/`, `database/`, `identity/`, `media/`, `api/`, `frontend/`, `operations/`) and link it in `docs/README.md`.
- Whenever diagrams are added or modified, adhere to the `.agents/skills/diagram-design` skill: update or create the `.mmd` source file in `docs/assets/`, apply semantic color classes, and render the `.png` using `bun run docs:render-diagrams` (`./docs/assets/render.sh`).
- In markdown files embedding diagram images (`![Title](../assets/<name>.png)`), NEVER duplicate raw `mermaid ` code blocks inside the markdown file; keep the markdown file clean and reference the rendered PNG only.
- **Major change → update the tracker + changelog, same PR.** A new domain/module, a schema change, a new app surface, or a breaking API change updates the master [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) and the corresponding app status tracker ([apps/api/IMPLEMENTATION_STATUS.md](apps/api/IMPLEMENTATION_STATUS.md), [apps/admin/IMPLEMENTATION_STATUS.md](apps/admin/IMPLEMENTATION_STATUS.md), or [apps/web/IMPLEMENTATION_STATUS.md](apps/web/IMPLEMENTATION_STATUS.md)), and adds an entry to [CHANGELOG.md](CHANGELOG.md) (newest first, link the PR). Routine fixes/refactors/doc typos don't need either.

## Writing & Markdown Prose

Committed files are English-only, except user-facing product copy in `apps/web`/`apps/admin`, which is Vietnamese-first (the site's actual audience).

**Never hard-wrap markdown prose.** One paragraph or list item is one continuous line, however long; never break lines mid-sentence. Let the editor/viewer soft-wrap it. Run `bun run format` after editing markdown — `oxfmt` is configured with `proseWrap: "never"` to collapse all prose blocks into single lines automatically.

## Code Comments & JSDoc Discipline

All code comments must adhere to standard JSDoc (`/** ... */`) format:

- **Standard JSDoc format**: Document exported functions, classes, interfaces, types, methods, controllers, and services with clean JSDoc (`/** ... */`) specifying concise purpose, `@param`, `@returns`, and `@throws` where applicable. `oxfmt` is configured with `jsdoc: true` and `oxlint` with `--jsdoc-plugin` to format and validate JSDoc blocks.
- **Zero comment noise / slop**:
  - Never add divider/separator lines (e.g., `// -------------------`, `/* ====== */`).
  - Never add obvious, redundant inline comments describing _what_ code does (e.g., `// increment counter`, `// call api`, `// return result`).
  - Never add conversational, monologue, or speculative comments.
  - Code must be self-documenting with expressive naming and clear structure.
- **Rationale-only comments**: Comments inside implementation blocks are strictly reserved for explaining _why_ (non-obvious domain rules, hardware/protocol constraints, security invariants). When necessary, use structured JSDoc or clean block comments rather than inline trailing noise.

## Testing & Spec Location

- **Dedicated `test/` directory**: All test files (unit specs, integration specs, e2e tests) for `apps/api` must be placed inside `apps/api/test/`, mirroring the `src/` directory structure (e.g., `test/access/guards/jwt-auth.guard.spec.ts`, `test/content/dto/upsert-content-translation.dto.spec.ts`).
- **Never colocate tests in `src/`**: Do not place `*.spec.ts` or `*.test.ts` files inside `apps/api/src/`. Keep source and test code strictly separated.

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
