---
name: autoreview
description: Run as an automated closeout code review before committing, opening a PR, or finishing a task in ttu-platform, or when conducting multi-axis code analysis.
---

# Auto Review

A structured closeout gate: review the change bundle against the codebase's real invariants, proof commands, and quality criteria before creating a commit or pull request.

## Contract

- **Report P0 (Blockers) Only by Default**: Focus strictly on issues that break runtime behavior, violate architectural invariants, leak drafts, or fail quality gates.
- **Treat Findings as Advisory**: Verify every finding by reading the surrounding code and real imports before making edits. Never blindly patch.
- **Root-Cause Fixes**: Fix issues at the owner boundary rather than hacking local symptom workarounds.
- **Scope Governor**:
  - **In-scope blocker**: Direct bug or invariant violation; fix immediately.
  - **Follow-up**: Real improvement, but different domain or broader scope; record it without bloating the current task.
  - **Stop-and-escalate**: Requires a major architectural, schema, or product decision outside the current task.

## Proof Commands for TTU Platform

Execute in order before passing the review:

```bash
git diff --stat "$(git merge-base HEAD main)"...HEAD   # inspect bundle scope
bun run format                                         # format with oxfmt
bun run format:check                                   # verify zero formatting drift
bun run lint                                           # oxlint + ESLint
bun run duplication                                    # jscpd check (< 3%)
bun run knip                                           # knip dead-code detector
moon run :typecheck                                    # TypeScript across all 3 apps
moon run api:test                                      # NestJS unit tests in apps/api/test/
moon run :build                                        # production build for all 3 apps
```

## What to Look For in TTU Platform

1. **Public Read Draft Leaks**:
   - Public content queries must **never** read draft columns from `content_translations` directly.
   - Public queries must inner-join `content_revisions` via `published_revision_id` and serve from the immutable snapshot.
2. **Test File Placement**:
   - Tests must reside inside `apps/api/test/`. Any `*.spec.ts` in `apps/api/src/` is an immediate P0 failure.
3. **Comment Discipline & JSDoc Standards**:
   - Exported symbols must use standard JSDoc (`/** ... */`).
   - Flag any divider lines (e.g. `// -------------------`), redundant inline comments (`// call api`), or conversational AI monologues.
4. **Markdown Prose Wrapping**:
   - No hard-wrapped markdown prose. Every paragraph or list item must be one continuous line (`proseWrap: "never"`).
5. **Diagrams & Documentation Sync**:
   - When diagram source files (`.mmd`) are touched, ensure the corresponding `.png` has been re-rendered via `bun run docs:render-diagrams`.
   - Ensure markdown files embed only the `.png` and do not duplicate raw `mermaid ` blocks.
6. **Destructive Migrations**:
   - Verify that generated Drizzle migrations in `apps/api/drizzle/` do not contain accidental `DROP COLUMN` statements where a rename was intended.
7. **Faculty Boundary Violations**:
   - Verify that `ttu_main` does not store faculty-specific datasets or organizational tables belonging to `ttu-faculty-platform`.
8. **Secrets Exposure**:
   - Ensure no real `.env` files are staged and no sensitive keys are leaked into git history or client bundles.
