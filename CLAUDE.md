# Claude Code Guidelines: TTU Platform

This repository replaces the WordPress site at ttu.edu.vn with a public website (`apps/web`), a content admin dashboard (`apps/admin`), and the API behind both (`apps/api`). See [AGENTS.md](AGENTS.md) for the full guide — this file is the same content, kept for tools that read `CLAUDE.md` specifically.

## Toolchain & Stack

- **Package Manager & Task Runner**: Bun 1.4.0 + Moon 2.5.3 (via `.prototools`/proto).
- **Frontend Applications**: Next.js 16 (App Router) + React 19 + Tailwind CSS 4.
- **Backend API**: NestJS 11 (Node 24 LTS) + Drizzle ORM against `ttu_main` (PostgreSQL).
- **Linters & Formatters**: Oxfmt, Oxlint + ESLint, Knip, JSCPD, Lefthook, Commitlint.
- **Testing**: Jest for `apps/api`.

## Current state — read before touching `apps/api`

`apps/api` has a database connection (`src/db/`), a Keycloak auth guard (`src/access/`), and its first business domain, Content + taxonomy (`src/content/`, `src/taxonomy/`). See [apps/api/IMPLEMENTATION_STATUS.md](apps/api/IMPLEMENTATION_STATUS.md) for the authoritative, up-to-date list of what's done, what's next, and what's blocked — read it first.

- Do not add an S3/MinIO client speculatively — wire it when a real upload endpoint needs it.
- Do not add `pages`/`page_sections` endpoints, and do not invent components/schemas to unblock them: the CMS Page Builder domain depends on a Component Registry (`packages/cms-registry`) and a real ~15-20-component set that don't exist in this repo yet — that is real product/design work, not something to fabricate to fill the gap.
- `apps/admin`'s actual sign-in UI (the browser-side OIDC redirect against `ttu-web`) is still open — nothing in `apps/admin` calls the API yet.

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

1. **Branching & Commits**: stay on the current branch; only branch for non-trivial changes as `<type>/<kebab-case-slug>`; Conventional Commits enforced by `commitlint` + `lefthook`.
2. **Documentation & Markdown Prose**: update `docs/` alongside any code change; never hard-wrap markdown prose (one continuous line per paragraph/bullet); committed files are English-only except Vietnamese-first product copy in `apps/web`/`apps/admin`.
3. **Code Comments & JSDoc Discipline**: all documentation comments must use standard JSDoc (`/** ... */`); zero comment noise/slop (no divider lines, no redundant inline comments, no AI monologues); comments only explain _why_.
4. **No speculative infrastructure**: no CMS Page Builder or storage code in `apps/api` until the Component Registry and a real upload use case exist — see [apps/api/IMPLEMENTATION_STATUS.md](apps/api/IMPLEMENTATION_STATUS.md).
5. **Major change → update the tracker + changelog, same PR.** A new domain/module, a schema change, a new app surface, or a breaking API change updates [apps/api/IMPLEMENTATION_STATUS.md](apps/api/IMPLEMENTATION_STATUS.md) and adds an entry to [CHANGELOG.md](CHANGELOG.md). Routine fixes/refactors/doc typos don't need either.
