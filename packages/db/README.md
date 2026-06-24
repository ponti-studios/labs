# @pontistudios/db

Shared database layer for all Ponti Studios labs apps. Built on **Drizzle ORM** with `postgres-js`. Owns the canonical schema, all migrations, and seed/load routines for the shared `labs` database.

## Schema

6 tables across 4 domains, all under the `labs` PostgreSQL schema:

| Domain        | Tables                                                        |
| ------------- | ------------------------------------------------------------- |
| puzzles       | `rhobh_daily_puzzles`                                         |
| relationships | `relationship_cases`, `case_updates`, `relationship_verdicts` |
| transport     | `tfl_cameras`                                                 |
| reference     | `covid_data`                                                  |

## Exports

```ts
import { db, closeDb } from "@pontistudios/db";

// Re-exported from drizzle-orm for convenience
import { eq, and, sql, count, desc } from "@pontistudios/db";

// Environment validation (zod)
import { DbEnv } from "@pontistudios/db";

// Table references for queries
import { rhobhDailyPuzzles, relationshipCases, tflCameras } from "@pontistudios/db";

// Types
import type {
  CovidData,
  NewCovidData,
  RhobhDailyPuzzle,
  NewRhobhDailyPuzzle,
  TflCamera,
  NewTflCamera,
  RelationshipCase,
  NewRelationshipCase,
  CaseUpdate,
  NewCaseUpdate,
  RelationshipVerdict,
  NewRelationshipVerdict,
} from "@pontistudios/db";

// Data loaders (for seeding)
import { populateCovidData, populateTflCameras } from "@pontistudios/db";
```

The `db` proxy lazily connects on first access using `DATABASE_URL` — no manual init required.

## Migrations

**Drizzle Kit** manages schema migrations. Generated SQL files live in `migrations/` — do not edit them by hand.

### Commands

```bash
pnpm --filter @pontistudios/db db:generate    # create migration from schema changes
pnpm --filter @pontistudios/db db:migrate     # apply pending migrations
pnpm --filter @pontistudios/db db:check       # verify schema matches DB state
pnpm --filter @pontistudios/db db:create-schema  # ensure the labs schema exists
```

### Making schema changes

1. Edit schema files in `src/schema/`
2. Run `pnpm --filter @pontistudios/db db:generate` — Drizzle creates a new migration file and snapshot in `migrations/`
3. Run `pnpm --filter @pontistudios/db db:migrate` to apply
4. Commit the generated migration SQL, snapshot, and updated `_journal.json`

### In CI

The `deploy-db-migrations.yml` workflow runs migrations on push to `main` when `packages/db/` changes. Each deploy workflow also runs the reusable migration before deploying, so the database is always up to date before an app release.

## Data loading

Seed routines for shared reference data:

```bash
pnpm --filter @pontistudios/db load:covid   # populate covid_data from CSV
pnpm --filter @pontistudios/db load:tfl     # populate tfl_cameras from data source
```

## Testing

Tests live in `tests/`. Run with:

```bash
pnpm --filter @pontistudios/db test
```

Requires a running PostgreSQL instance pointed at by `DATABASE_URL`.
