## Context

The `apps/earth` workspace was generated via the GitHub Spark template and
initially worked as a React + Vite app with an optional SQLite/Atlas layer.  Over
time the codebase accumulated duplicate files, the database code became unused,
and the README and tasks drifted from reality.  There is no backend server;
the frontend fetches events directly from NASA’s EONET API.  Bun support has
been discussed but not implemented, and some dependencies (notably
`better-sqlite3`) may not function under Bun.

## Goals / Non-Goals

**Goals:**
- Make `npm install && npm run dev` a reliable path to a working application.
- Consolidate database tooling under `db/` and ensure migrations run cleanly.
- Evaluate Bun compatibility and update scripts accordingly.
- Remove extraneous or confusing files (root duplicates, empty workspaces).
- Provide clear, updated developer documentation and a simple db proof of
  concept.
- Establish a baseline for future enhancements (API cache, tests, offline
  support).

**Non-Goals:**
- Adding a backend API or implementing event caching logic.
- Writing comprehensive automated tests (beyond a minimal POC).
- Deploying to production or packaging as a PWA.

## Decisions

- **Canonical DB location:** Keep `db/` as the authoritative directory and
  eliminate root-level `schema.sql` and `check.ts`.  This reduces confusion and
  aligns with Atlas defaults.
- **Bun vs Node runtime:** Attempt to run everything under Bun; if database
  bindings fail, retain Node for DB scripts and document this fallback.  The
  front-end build is priority, so Bun compatibility is desirable but not
  blocking.
- **Tooling updates:** Convert `npm`/`npx` script invocations to `bun`/`bunx` in
  `package.json`.  Generate `bun.lockb` and commit it alongside `pnpm-lock.yaml`.
- **Workspace cleanup:** Remove empty entries from `pnpm-workspace.yaml` and
  `packages/*` directories to speed up installs and reduce maintenance.
- **Documentation:** Rewrite README to reflect verified commands and note
  optional Bun instructions.  Preserve the longer-term thoughts in a roadmap
  (existing `docs/plan.md` can serve this purpose).

## Risks / Trade-offs

- [Bun incompatibility] → Some dependencies like `better-sqlite3` may not build
  under Bun.  **Mitigation:** run DB scripts with Node, document the limitation,
  and optionally explore alternative drivers later.
- [Breaking changes] → Removing duplicate files could accidentally break
  scripts that reference them.  **Mitigation:** run all scripts after cleanup
  and ensure `npm run db:check` still works before deleting extras.
- [Documentation drift] → Changes to scripts or configs may get out of sync.
  **Mitigation:** include verification commands in README and run lint/build
  during the change.

## Open Questions

- Should we formally remove the SQLite layer if Bun proves too difficult, or
  keep it as an untested optional feature?
- Is there appetite to convert the repository into a monorepo earlier, or is the
  `packages/` workspace intended for future independent packages?
