## Why

The `apps/earth` repository has drifted since its initial Spark scaffold: existing
plan notes document a mix of unused database code, duplicate files, and missing
setup guidance. Developers struggle to get the project running and the codebase
lacks a clear maintenance path. Bringing the repo into a clean, documented,
and runnable state will reduce onboarding friction and set the stage for future
enhancements.

## What Changes

- Verify and standardize developer environment (Node 18+, optional Bun) and
  ensure all npm/pnpm scripts execute correctly.
- Initialize and validate the SQLite/Atlas database layer, removing redundant
  root-level files and consolidating tooling under `db/`.
- Audit for Bun compatibility, update scripts, and generate a `bun.lockb`.
- Clean up workspace configuration (`packages/`), `tsconfig` paths, and other
  vestigial artifacts.
- Update documentation: README, developer notes, and add a roadmap section.
- Provide a small proof‑of‑concept that exercises the DB layer.
- Define long‑term ideas (backend API, tests, offline support) for later work.

## Capabilities

### New Capabilities
- `repo-maintenance`: Establishes a set of housekeeping tasks that make the
  `apps/earth` repository easy to set up, build, and modify.

### Modified Capabilities
- *none* (no existing spec requirements change)

## Impact

Affected code and systems include:

- `package.json` scripts and `pnpm-workspace.yaml`
- `db/` directory and associated migration scripts
- Root duplicates such as `schema.sql` and `check.ts`
- Documentation files (`README.md`, `docs/plan.md`)
- tooling around Bun (`bun.lockb`, script replacements)
- TypeScript configs (`tsconfig.json`, `tsconfig.db.json`)

No external APIs will change; the work is internal to the repository and
documentation.