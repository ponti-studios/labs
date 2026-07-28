# Agent Rules — Labyrinth

This file defines hard constraints for AI agents working in this repository.
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

1. Edit a schema file in `app/lib/server/db/schema/` (e.g. `base.ts`, `realitea.ts`)
2. Run `pnpm db:generate` to create the migration SQL and snapshot
3. Run `pnpm db:migrate` to apply locally and verify
4. Commit the schema change, generated migration file, and snapshot together

**Idempotent migrations (`IF NOT EXISTS` / `IF EXISTS`) are never the right answer.**
If a column or table is missing, the appropriate migration was never applied — create a proper Drizzle migration through the schema file.

### Reference

| Command              | Purpose                                     |
| -------------------- | ------------------------------------------- |
| `pnpm db:generate`   | Generate a migration from schema changes    |
| `pnpm db:migrate`    | Apply pending migrations to the target DB   |
| `drizzle.config.ts`  | Drizzle configuration (schema glob, output) |
| `app/lib/server/db/schema/` | All table schema files live here     |

### What to do when a migration was skipped in production

Do **not** hand-write a workaround migration. Instead:

1. Inspect `drizzle.__drizzle_migrations` in the target database to understand which entries exist
2. If a migration hash exists in the tracking table but the DDL was never applied, the tracking entry is stale — the fix is to delete that tracking row so `drizzle-kit migrate` re-applies the real migration
3. If that's not possible (no direct DB access), create a no-op schema change in the Drizzle schema file, generate a new migration, and let it carry the real change forward

The purpose of this rule is to keep `_journal.json`, the snapshot files, and the database's tracking table in agreement at all times.

## Script Environment Validation

All scripts (`scripts/*.ts`) must validate their environment using `LabyrinthServerEnv.parse(process.env)` from `app/lib/server/env.ts`.

- ❌ Do not define ad-hoc `requireEnvironment()` functions
- ❌ Do not inline `if (!process.env.X)` checks

This ensures every script validates the same set of required variables and produces consistent error messages.

## RealiTea Puzzle Generation

- The single entry point for all puzzle management is `scripts/realitea.generate.ts`
- Normal mode: `pnpm realitea:generate` (gap-fill, daily cron)
- Force-regenerate mode: `pnpm realitea:generate -- --force` (deletes and regenerates all future puzzles)
- Do not create separate "regenerate" scripts — the `--force` flag handles that
- Both the daily cron and manual force-regenerate runs share one workflow: `.github/workflows/realitea-generate.yml` (schedule trigger runs gap-fill mode; `workflow_dispatch` trigger runs `--force --days-ahead=<input>`)

## Storybook Development Only

- Storybook is development-only in this repository.
- Never run `storybook build`, `build-storybook`, or any equivalent production Storybook export.
- Use the `storybook` script (`storybook dev -p 6007`) for local validation.
- Do not add CI, package scripts, or deployment steps that build Storybook statically.
