# @pontistudios/db

Shared database schema and utilities for all Ponti Studios labs apps. Exports a Kysely client factory and the canonical Drizzle ORM schema.

## Schema

19 tables across 5 domains:

| Domain | Tables |
|---|---|
| disaster | `disaster_events` |
| relationships | `relationship_people`, `relationship_stage_history`, `relationship_events`, `relationship_notes`, `relationship_checkins`, `relationship_flags`, `relationship_friend_invites`, `relationship_friend_votes`, `relationship_metrics_daily` |
| playground | `covid_data`, `tfl_cameras`, `todos`, `tags`, `todo_tags`, `embeddings` |
| social | `trackers`, `votes` |
| kuma | `users`, `messages` |

## Migration tool

**Drizzle Kit** manages schema migrations. SQL files live in `migrations/` and are generated from the schema — do not edit them manually.

### Available commands

```bash
pnpm --workspace packages/db db:generate   # generate migration from schema changes
pnpm --workspace packages/db db:migrate   # apply pending migrations
pnpm --workspace packages/db db:check      # verify schema matches DB state
```

### Making schema changes

1. Edit schema files in `src/schema/`
2. Run `pnpm --workspace packages/db db:generate` — Drizzle creates a new migration file in `migrations/`
3. Run `pnpm --workspace packages/db db:migrate` to apply

### Migration CI

The `db-migrate` job runs in CI before lint/test/build. It:
1. Clones foundation (provides postgres via docker compose)
2. Creates the `labs` database
3. Runs `db:migrate`

## Consuming from apps

Import from anywhere in the workspace:

```ts
import { createDb, getDb } from '@pontistudios/db';
```

Or import specific table definitions:

```ts
import { trackers, votes } from '@pontistudios/db';
```

## Building

```bash
npm --workspace packages/db run build
```

Build output goes to `dist/`. The workspace root `.gitignore` ignores `dist`.

## Testing

```bash
npm --workspace packages/db run test
```
