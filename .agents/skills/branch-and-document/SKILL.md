---
name: branch-and-document
description: Follow branching, commit messaging, and continuous documentation workflows before creating code changes or pull requests in ttu-platform.
---

# Branch and Document

## 1. Branching Strategy

- **Small Changes** (typo fixes, minor config tweaks, direct doc edits): Commit directly to the current working branch.
- **Non-Trivial Changes** (new endpoints, schema modifications, cross-app dependencies, component additions): Create a branch from the active base branch:

  ```bash
  git checkout -b <type>/<kebab-case-slug>
  ```

  `type` must match `commitlint.config.mjs`: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `style`, `ci`, `build`, `revert`. _Never prefix branches with AI tool names (no `cursor/...`, `claude/...`, `codex/...`)._

- **Push Frequently**: Push feature branches to `origin` once there is a commit worth seeing.
- **Delete Merged Branches**: Once merged into `main` or a base branch, delete the temporary branch immediately both locally (`git branch -d <branch>`) and on remote (`git push origin --delete <branch>`).
- **Protected Primary Branches**: Never delete `main`, `prod`, `staging`, `testing`, or `develop`.

## 2. Commit Message Standards

Conventional Commits are enforced by `commitlint` and `lefthook`:

- **Format**: `<type>(<scope>): <short description>`
- **Header Length**: **Maximum 100 characters.** Exceeding 100 characters fails the commit hook.

## 3. Continuous Documentation Rule

A code change is **never complete** until documentation reflects reality:

1. **Keep `docs/` in Sync**:
   - Updating an existing domain? Update the corresponding file under `docs/overview/`, `docs/architecture/`, `docs/database/`, `docs/identity/`, `docs/media/`, `docs/api/`, `docs/frontend/`, or `docs/operations/`.
   - Feature exists in code but missing from `docs/`? Create a new Markdown file in the appropriate topic subfolder and register it in [docs/README.md](../../../docs/README.md).
2. **Diagram Lifecycle (`diagram-design` skill)**:
   - Edit or create Mermaid source in `docs/assets/<name>.mmd`.
   - Re-render the 2x PNG image:
     ```bash
     bun run docs:render-diagrams
     ```
   - Embed the PNG into the markdown document (`![Title](../assets/<name>.png)`).
   - **Never duplicate raw `mermaid ` code blocks in markdown files where the image is embedded.**
3. **Status Trackers & Changelog**:
   - Major changes (new domain, schema change, new app surface, breaking API change) require updating:
     - Root [IMPLEMENTATION_STATUS.md](../../../IMPLEMENTATION_STATUS.md)
     - Corresponding application tracker ([apps/api/IMPLEMENTATION_STATUS.md](../../../apps/api/IMPLEMENTATION_STATUS.md), [apps/admin/IMPLEMENTATION_STATUS.md](../../../apps/admin/IMPLEMENTATION_STATUS.md), or [apps/web/IMPLEMENTATION_STATUS.md](../../../apps/web/IMPLEMENTATION_STATUS.md))
     - [CHANGELOG.md](../../../CHANGELOG.md) (newest first, linking the PR).
