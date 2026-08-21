# Agent Rules — Labyrinth

This file defines hard constraints for AI agents working in this repository.
Violating these rules will produce incorrect or unsafe work.

## Required operational guide

Before making changes that affect environment variables, routes, databases,
authentication, cross-service ownership, or deployment, read
[Core development flows](docs/operations/core-development-flows.md) and
[Deployment and routing lessons](docs/operations/deployment-and-routing.md).
These documents define the required pre-merge provisioning, CI ordering, and
post-deployment verification steps.

## Development Infrastructure (Foundation Compose)

Labs is the application codebase. Local infrastructure is owned by the sibling
Foundation repository at `/Users/charlesponti/Developer/foundation`.

- Do not add or duplicate PostgreSQL, Redis, or MinIO Compose services in Labs.
- Keep the Labs application running on the host during normal development.
- Start local infrastructure from Foundation, not from this repository:
  - Dev stack: `docker compose -f compose/base.yml -f compose/dev.yml up -d`
  - Test database: `docker compose -f compose/test.yml up -d db-test`
- Foundation's canonical host connection endpoints are:

  | Service | Host URL / port | Database |
  | ------- | --------------- | -------- |
  | Dev PostgreSQL | `localhost:5434` | `hominem` |
  | Test PostgreSQL (`db-test`) | `localhost:4433` | `hominem-test` |
  | Dev Redis | `localhost:6379` | — |
  | Dev MinIO API | `localhost:9000` | — |
  | Dev MinIO console | `localhost:9001` | — |

- Labs tests must use `postgresql://postgres:postgres@localhost:4433/hominem-test`
  regardless of local `.env` files or CI environment variables.
- Do not point Labs at `labs-test`; that was a stale legacy database and has
  been removed. Do not create it again.
- The Foundation `db-test` service uses a named persistent volume. It is not
  automatically ephemeral; only remove test data when explicitly requested.
- Do not rebuild, reset, or drop a database to work around a migration failure.
  Inspect the target database and fix the migration chain using the Drizzle
  workflow below. Never use a local Homebrew PostgreSQL instance as a substitute
  for Foundation's databases.
- Before changing infrastructure definitions, inspect and edit the Compose
  files in Foundation. Keep host-to-container ports and database names aligned
  with the table above.

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

1. Edit a schema file in `app/lib/server/db/schema/` (e.g. `base.ts`, `what.ts`)
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

## What Puzzle Generation

- The single entry point for all puzzle management is `scripts/what-generate.ts`
- Normal mode: `pnpm what:generate` (gap-fill, daily cron)
- Force-regenerate mode: `pnpm what:generate -- --force` (deletes and regenerates all future puzzles)
- Do not create separate "regenerate" scripts — the `--force` flag handles that
- Both the daily cron and manual force-regenerate runs share one workflow: `.github/workflows/what-generate.yml` (schedule trigger runs gap-fill mode; `workflow_dispatch` trigger runs `--force --days-ahead=<input>`)

## Authentication (Hominem)

Hominem's Better Auth deployment is the sole auth authority for this repo. Labs
never issues or validates its own sessions, and never hosts a login form.

- Session checks go through `getHominemUser()` in `app/lib/server/hominem-auth.ts`
  (server-only — it forwards the request's `Cookie` header to the Hominem API).
- To send a player to sign in, use `buildHominemLoginUrl(returnTo)`. `returnTo`
  must be an absolute labs URL; the Hominem API only honors origins it trusts as
  `LABS_URL`.
- ❌ Do not add a login/OTP form, session table, or token issuance to this repo.

### Public npm Packages

`@ponti-studios/auth` and `@ponti-studios/ui` are published as public npm
packages. No GitHub Packages token or registry override is required to install
them locally or in CI.

## Storybook Development Only

- Storybook is development-only in this repository.
- Never run `storybook build`, `build-storybook`, or any equivalent production Storybook export.
- Use the `storybook` script (`storybook dev -p 6007`) for local validation.
- Do not add CI, package scripts, or deployment steps that build Storybook statically.
