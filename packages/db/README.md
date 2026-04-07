# @pontistudios/db

Shared database utilities for all Ponti Studios apps. This package exports a
Kysely client factory, environment helpers, and the canonical schema/migrations.

## Features

* `createDb`, `withDb` helpers with typed config (`DbConfig`).
* Zod‑based `DbEnv` parser for environment variables.
* MySQL migrations via **Flyway** stored in `src/migrations/` and bundled into the build.
* Basic Vitest smoke tests verifying the client API.

## Running migrations

The package uses **Flyway** for MySQL schema migrations. SQL files live in
`src/migrations/` and are bundled into the build output.

### Available commands

```bash
# from root
npm --workspace packages/db run db:migrate          # apply pending migrations
npm --workspace packages/db run db:migrate:info    # show migration status
npm --workspace packages/db run db:migrate:validate # validate applied migrations
npm --workspace packages/db run db:migrate:repair   # repair Flyway history table
```

Migration files use Flyway's versioned naming convention:

```text
V1__disaster_events_initial.sql
V2__add_source_timestamp.sql
V3__relationship_intelligence_initial.sql
```

To add a new migration, create the next `V<N>__<name>.sql` file in
`src/migrations/` and run `db:migrate` to apply it.

### Consuming from apps

Apps can rely on the shared migration scripts exposed by `@pontistudios/db`.
You do *not* need to copy the SQL anywhere — the build process copies the
`migrations` folder into `dist` so that published versions include the schema.

## Testing

Run `npm --workspace packages/db run test` to execute the package's
Vitest suite. The tests verify environment parsing and that `createDb`/
`withDb` return a valid Kysely instance.

## Usage in code

Import from anywhere in the workspace:

```ts
import { createDb, withDb, DbEnv } from '@pontistudios/db';

const env = DbEnv.parse(process.env);
await withDb(env, async (db) => {
  const rows = await db.selectFrom('disaster_events').selectAll().execute();
});
```

## Building

```bash
npm --workspace packages/db run build
```

The output goes to `dist/`, and `dist/migrations` contains the SQL migration
files. The workspace's root `.gitignore` already ignores `dist`.
