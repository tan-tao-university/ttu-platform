---
name: verifying-monorepo-changes
description: Run verification checks before committing, opening a PR, or finishing a task in ttu-platform, or when CI fails on a check that passed locally.
---

# Verifying Monorepo Changes

## Overview

Three applications (`apps/web`, `apps/admin`, `apps/api`) share one codebase and toolchain. A change in the database schema, shared configuration, or API contract can break another application. Run the full verification pass across the whole workspace, not just the directory you edited.

## The Full Verification Pass

Run before finishing any task, opening a PR, or creating a commit:

```bash
bun run format:check                         # oxfmt validation (proseWrap: never, jsdoc: true)
bun run lint                                 # oxlint across repo, then per-app ESLint via Moon
bun run duplication                          # jscpd copy-paste detection (threshold < 3%)
bun run knip                                 # dead-code & unused dependency detector
moon run :typecheck                          # TypeScript across all 3 projects
moon run api:test                            # NestJS unit tests in apps/api/test/
moon run :build                              # build Next.js (web/admin) and NestJS (api)
```

## Two Linters, on Purpose

`bun run lint` executes `oxlint && moon run :lint`:

- **oxlint**: High-performance Rust linter over the entire repo in milliseconds, enforcing correctness and JSDoc rules. Configured at `.oxlintrc.json`. Autofix with `bun run lint:fix`.
- **ESLint**: Per-app execution via Moon for framework-specific rules (`eslint-config-next` in Next.js apps, `@typescript-eslint` in NestJS API).

**oxlint printing nothing is a pass.** It is silent when clean and exits 0; errors go to stdout with a non-zero exit. Do not mistake silence for failure to execute.

## Formatting with oxfmt

The project uses `oxfmt` configured in `.oxfmtrc.json`:

- **`proseWrap: "never"`**: Markdown paragraphs and bullet items are collapsed to single continuous lines.
- **`jsdoc: true`**: Normalizes and reformats JSDoc comment blocks automatically.

Run `bun run format` to write formatting changes in place before running `bun run format:check`.

## Testing Conventions

All unit and integration tests for `apps/api` reside in `apps/api/test/`, never colocated in `src/`.

- Unit tests: `moon run api:test`
- E2E tests: `bun run --cwd apps/api test:e2e`
- Path alias `@/*` maps directly to `apps/api/src/*` in test files.

## Reading Moon Output

Moon uses a directed action graph to execute workspace tasks:

- **ran**: The task executed and produced fresh outputs.
- **cached**: Unchanged inputs; result was safely reused from `.moon/cache`. **A cache hit is a pass.**
- **skipped**: The task does not apply to that project.

To bust Moon's cache for a clean rebuild, delete `.moon/cache` or run `bun run clean`.

## Scoping While Iterating

For fast inner-loop development:

```bash
moon run api:test                            # Run unit tests only
moon run api:typecheck                       # Typecheck API only
moon run web:build                           # Build public site only
```

Always run the full 7-command verification pass before creating a commit.
