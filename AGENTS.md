# Agent Rules — Labs

This file defines hard constraints for AI agents working in this repository.
Violating these rules will produce incorrect or unsafe work.

## Required operational guide

Before making changes that affect environment variables, routes, databases,
authentication, cross-service ownership, or deployment, read
[Core development flows](docs/operations/core-development-flows.md) and
[Deployment and routing lessons](docs/operations/deployment-and-routing.md).
These documents define the required pre-merge provisioning, CI ordering, and
post-deployment verification steps.

For any environment-variable change, also read the
[environment configuration contract](docs/operations/environment-configuration.md).
It requires agents to classify runtime versus build-time values, declare Vite
variables in Docker build stages, and scan Railway/GitHub configuration before
merging.

## Development Infrastructure (Foundation Compose)

Labs is the application codebase. Local infrastructure is owned by the sibling
Foundation repository at `/Users/charlesponti/Developer/foundation`.

Labs is a single pnpm application rooted at this repository. Do not reintroduce
pnpm workspaces or app code under a nested `packages/` directory.

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

- The local development database URL is:
  `postgresql://postgres:postgres@localhost:5434/hominem`
- The local test database URL remains:
  `postgresql://postgres:postgres@localhost:4433/hominem-test`
  regardless of local `.env` files or CI environment variables.

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

1. Edit a schema file in `app/lib/server/db/schema/` (e.g. `base.ts`, `game.ts`, `search.ts`)
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
| `drizzle.config.ts` | Drizzle configuration (schema glob, output) |
| `app/lib/server/db/schema/` | All table schema files live here |

### What to do when a migration was skipped in production

Do **not** hand-write a workaround migration. Instead:

1. Inspect `drizzle.__drizzle_migrations` in the target database to understand which entries exist
2. If a migration hash exists in the tracking table but the DDL was never applied, the tracking entry is stale — the fix is to delete that tracking row so `drizzle-kit migrate` re-applies the real migration
3. If that's not possible (no direct DB access), create a no-op schema change in the Drizzle schema file, generate a new migration, and let it carry the real change forward

The purpose of this rule is to keep `_journal.json`, the snapshot files, and the database's tracking table in agreement at all times.

## Script Environment Validation

Labs scripts must validate required environment values through the schemas in
`app/lib/server/env.ts` and `app/lib/server/db/env.ts`.

- ❌ Do not define ad-hoc `requireEnvironment()` functions
- ❌ Do not inline `if (!process.env.X)` checks for required configuration

## Authenticated Testing

- For every UI change, verify the result in a browser before considering the
  work complete. Use the local app and its dedicated test account when the UI
  requires authentication; capture a screenshot when it helps document the
  result or the user asks for one.
- Browser, manual, and end-to-end tests that need an authenticated Labs user use the local test account `test@lvh.me`. Never use a personal account for testing.
- Keep authenticated testing on local or explicitly disposable test services; never submit test-account credentials or OTPs to production.
- For local sign-in, trigger the OTP from the app, then retrieve it with Hominem's `just otp test@lvh.me` helper. Do not read the mailbox file directly.
- Unit tests that mock authentication can keep using isolated fixture identities. Multi-user tests may use additional synthetic test accounts when distinct identities are required.

## Authentication (Hominem)

Hominem's Better Auth deployment is the sole auth authority for this repo. Labs
never issues or validates its own sessions, and never hosts a login form.

- Session checks go through `getHominemUser()` in `app/lib/server/hominem-auth.ts`
  (server-only — it forwards the request's `Cookie` header to the Hominem API).
- To send a player to sign in, use `buildHominemLoginUrl(returnTo)`. `returnTo`
  must be an absolute Labs URL; the Hominem API only honors origins it trusts as
  `LABS_URL`.
- ❌ Do not add a login/OTP form, session table, or token issuance to this repo.

### Public npm Packages

`@ponti-studios/auth` and `@ponti-studios/ui` are published as public npm
packages. No GitHub Packages token or registry override is required to install
them locally or in CI.

## Storybook Development Only

- Storybook is development-only in this repository.
- Never run `storybook build`, `build-storybook`, or any equivalent production Storybook export.
- Use the `storybook` script for local validation — Labs runs `storybook dev -p 6007` from the repository root.
- Do not add CI, package scripts, or deployment steps that build Storybook statically.
