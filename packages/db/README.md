# @pontistudios/db

Shared database utilities for all Ponti Studios apps. This package exports a
Kysely client factory, environment helpers, and the canonical schema/migrations.

## Features

* `createDb`, `withDb` helpers with typed config (`DbConfig`).
* Zod‑based `DbEnv` parser for environment variables.
* Atlas migrations stored in `migrations/` and bundled into the build.
* Basic Vitest smoke tests verifying the client API.

## Running migrations

The package ships an `atlas.hcl` config file that points at the local
`migrations/` folder and uses `DATABASE_URL` for the connection string. You can
run Atlas commands from within the package or from any workspace that depends on
`@pontistudios/db`.

### Available commands

```bash
# from root or any workspace that includes this package
pnpm --filter @pontistudios/db run db:migrate:diff --name <name>
pnpm --filter @pontistudios/db run db:migrate:apply
pnpm --filter @pontistudios/db run db:migrate:status
```

The scripts are simple wrappers around the Atlas CLI; they are defined in the
package's `package.json`:

```json
"scripts": {
  "build": "tsc && cp -R migrations dist/migrations",
  "typecheck": "tsc --noEmit",
  "test": "vitest",
  "db:migrate:diff": "bunx atlas migrate diff ${npm_config_name} --env mysql",
  "db:migrate:apply": "bunx atlas migrate apply --env mysql",
  "db:migrate:status": "bunx atlas migrate status --env mysql",
  "clean": "rm -rf dist tsconfig.tsbuildinfo"
},
```

> Note: the `mysql` environment in `atlas.hcl` is used for these commands; the
> `local` environment includes an explicit `src` definition for diff generation.

### Consuming from apps

Apps such as `apps/earth` already reference these migrations via their own
`atlas.hcl` file (see its relative `src` and `migration.dir` settings). Running
migration commands inside the app simply manipulates the shared files. You do
*not* need to copy the SQL anywhere — the build process copies the `migrations`
folder into `dist` so that published versions include the schema.

## Testing

Run `pnpm --filter @pontistudios/db run test` to execute the package's
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

Standard TypeScript build:

```bash
pnpm --filter @pontistudios/db run build
```

The output goes to `dist/`, and `dist/migrations` contains the SQL migration
files. The workspace's root `.gitignore` already ignores `dist`.
