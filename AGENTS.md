# Agent Rules — Ponti Studios Labs

This file defines hard constraints for AI agents working in this monorepo.
Violating these rules will produce incorrect or unsafe work.

## Database Migrations (Drizzle Only)

This project uses **Drizzle ORM** for all schema and migration management.
The migration pipeline is:

```
schema file → drizzle-kit generate → migration SQL → drizzle-kit migrate → database
```

**Forbidden:**

- ❌ Writing raw migration SQL files manually (e.g. creating `migrations/0005_*.sql` by hand)
- ❌ Running `ALTER TABLE`, `CREATE INDEX`, or any DDL directly via `psql`, a GUI, or a script
- ❌ Editing a migration file that has already been applied to any non-disposable environment
- ❌ Hand-editing `_journal.json` or snapshot files

**Required workflow for any schema change:**

1. Edit a schema file in `packages/db/src/schema/` (e.g. `puzzles.ts`, `base.ts`)
2. Run `pnpm --filter @pontistudios/db db:generate` to create the migration SQL and snapshot
3. Run `pnpm --filter @pontistudios/db db:migrate` to apply locally and verify
4. Commit the schema change, generated migration file, and snapshot together

**Idempotent migrations (`IF NOT EXISTS` / `IF EXISTS`) are never the right answer.**
If a column or table is missing, the appropriate migration was never applied — create a proper Drizzle migration through the schema file.

### Reference

| Command                                      | Purpose                                         |
| -------------------------------------------- | ----------------------------------------------- |
| `pnpm --filter @pontistudios/db db:generate` | Generate a migration from schema changes        |
| `pnpm --filter @pontistudios/db db:migrate`  | Apply pending migrations to the target DB       |
| `pnpm --filter @pontistudios/db db:check`    | Check for schema drift                          |
| `packages/db/drizzle.config.ts`              | Drizzle configuration (schema glob, output dir) |
| `packages/db/src/schema/`                    | All table schema files live here                |

### What to do when a migration was skipped in production

Do **not** hand-write a workaround migration. Instead:

1. Inspect `drizzle.__drizzle_migrations` in the target database to understand which entries exist
2. If a migration hash exists in the tracking table but the DDL was never applied, the tracking entry is stale — the fix is to delete that tracking row so `drizzle-kit migrate` re-applies the real migration
3. If that's not possible (no direct DB access), create a no-op schema change in the Drizzle schema file, generate a new migration, and let it carry the real change forward

The purpose of this rule is to keep `_journal.json`, the snapshot files, and the database's tracking table in agreement at all times.

## Script Environment Validation

All scripts (`scripts/*.ts`) must validate their environment using `LabyrinthServerEnv.parse(process.env)` from `apps/labyrinth/app/lib/server/env.ts`.

- ❌ Do not define ad-hoc `requireEnvironment()` functions
- ❌ Do not inline `if (!process.env.X)` checks

This ensures every script validates the same set of required variables and produces consistent error messages.

## RealiTea Puzzle Generation

- The single entry point for all puzzle management is `scripts/realitea.reconcile.ts`
- Normal mode: `pnpm realitea:reconcile` (gap-fill, daily cron)
- Force-regenerate mode: `pnpm realitea:reconcile -- --force` (deletes and regenerates all future puzzles)
- Do not create separate "regenerate" scripts — the `--force` flag handles that
- The cron workflow is `.github/workflows/cron-realitea-generate.yml`
- The manual regenerate workflow is `.github/workflows/realitea-regenerate.yml`
