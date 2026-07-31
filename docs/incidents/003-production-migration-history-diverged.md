---
id: 3
title: "Production migration history diverged (case_updates)"
date: 2026-07-29
status: resolved
severity: critical
category: database-migration
services: [labs, postgres]
tags: [drizzle, migrations, production-data, ci]
related_incidents: []
doc: docs/hominem-auth-integration.md
---

# Production migration history diverged (case_updates)

**Symptom:** `deploy-labyrinth-prod`'s `migrate` job failing with no
diagnostic output — just a frozen spinner.

**Root cause of the silent failure:** drizzle-kit's CLI progress renderer
(`MigrateProgress.render()` in `drizzle-kit/bin.cjs`) treats a `"rejected"`
status identically to `"pending"` and never surfaces the caught error
object — a drizzle-kit bug, confirmed by reading the compiled source.
Worked around with a temporary script (`scripts/debug-migrate.ts`, deleted
after use) calling `drizzle-orm/postgres-js/migrator`'s `migrate()`
directly to expose the real error, run in prod via a temporary
`workflow_dispatch` workflow (`.github/workflows/debug-migrate.yml`, also
deleted after use).

**Root cause of the actual migration failure:** the real error was `DROP
TABLE "labs"."case_updates" CASCADE` failing because the table didn't
exist. Diagnosed by hash-matching every local migration file's SHA256
against the 5 rows tracked in prod's `labs.__drizzle_migrations`: one
tracked row (hash `730a701c...`) had **no corresponding file** in the
current `migrations/` directory at all — the local migration history had
been rewritten/regenerated at some point *after* it was already applied to
production, which violates the repo's own rule (`AGENTS.md`) against
editing already-applied migrations.

Given the destructive, hard-to-reverse nature of hand-editing production's
migration tracking table, this was paused and escalated rather than guessed
at. **User's explicit instruction: "just delete the stale tracking row and
re-run."**

That alone wasn't sufficient — replaying migration `0011`'s `DROP TABLE
case_updates` would still fail on a genuinely-absent table. So a bare
`case_updates` table shell (exact original column definition from
`0000_baseline.sql`, no FK/index since it's dropped again seconds later)
was recreated to let migration `0011` complete legitimately, without
hand-editing any committed migration file.

Verified via the one-off debug workflow: `MIGRATE_DEBUG_SUCCESS`, confirmed
final `labs` schema table list including `realitea_attempts`. Debug files
cleaned up afterward (commit `3155e9d1`).

Sequence of commits: `67827889` (debug script), `57552c95`
(introspection), `00202196` (the actual repair), `3155e9d1` (cleanup).
