# ✨ Welcome to Your Spark Template!
You've just launched your brand-new Spark Template Codespace — everything’s fired up and ready for you to explore, build, and create with Spark!

This template is your blank canvas. It comes with a minimal setup to help you get started quickly with Spark development.

## Getting Started

### Prerequisites
- Node 18+ (or Bun 1.3+ if you prefer).  This repo uses pnpm for package management.
- A shell that supports environment variables (zsh, bash, etc.)
- Docker & docker-compose (for running a local MySQL instance)


### Initial setup
```bash
cd apps/earth
pnpm install        # or `bun install` to generate bun.lock and work with bun
```

You can spin up a MySQL server with Docker:

```bash
docker compose up -d mysql
export DATABASE_URL=mysql://labs:labs_password@localhost:3306/labs
# run schema migration if necessary (Atlas will use DATABASE_URL when provided):
pnpm run db:migrate:apply --env mysql
```

The compose file lives at `apps/earth/docker-compose.yml` and uses the
latest MySQL 8.1 image.  When `DATABASE_URL` is set to a mysql:// URL the
app will automatically switch Kysely/Atlas to the MySQL dialect; the
`sync` script will then write collected events into that server instead of
`db/app.db`.  You can verify with a client such as TablePlus or by looking at
the `disaster_events` table in the MySQL instance.

> **Tip:** to load the existing sqlite data into MySQL, simply set
> `DATABASE_URL` and run `pnpm run sync` again; new records will upsert and
> the same table structure is used.

> **Tip:** the root workspace has multiple packages; installing at the root will
also populate other demo apps.  You can run commands from within `apps/earth`.

### Common commands
| Task | Command |
|------|---------|
| Start dev server | `pnpm run dev` (or `bun run dev`) |
| Build for production | `pnpm run build` (or `bun run build`) |
| Lint & fix code | `pnpm run lint` |
| DB check | `pnpm run db:check` |
| Apply schema | `pnpm run db:schema:apply` |
| Import latest EONET events | `pnpm run sync:nasa` |  # may fail with 500 if NASA API is down

> All npm scripts are aliased to `bunx` when using Bun; you may still use
`npm run`/`pnpm run` if Bun is not installed.

## Database (Kysely + Atlas)

This workspace includes a local SQLite database setup using Kysely for
type-safe queries and Atlas for schema migrations.

- Default DB file is `db/app.db`.
- Schema lives at `db/schema.sql`; migrations are stored under `db/migrations`.
- Use `DATABASE_FILE=/path/to/file.db` to override the database path in any
  script.

> **Bun support note:** the project can run with Bun, but the `better-sqlite3`
> native dependency often fails to compile under Bun’s runtime.  If you hit
> build errors when running `db:check`, `db:migrate:*`, or similar scripts,
> simply run them with Node (`npm run ...`) until a Bun-compatible driver is
> available.

### Common DB commands
- Generate a migration: `pnpm run db:migrate:diff --name init`
- Apply pending migrations: `pnpm run db:migrate:apply`
- Check migration status: `pnpm run db:migrate:status`
- Quick health check: `pnpm run db:check`

### Proof-of-concept script
A simple script at `scripts/test-db.ts` inserts and counts rows in
`disaster_events`. Run with `pnpm run db:check` or `bunx tsx scripts/test-db.ts`.


---

The rest of the original README content follows unchanged below.


### Installed integration points

- Atlas config: `atlas.hcl`
- SQL schema source: `db/schema.sql`
- Migration directory: `db/migrations`
- Kysely DB client and types: `db/client.ts`, `db/types.ts`

### Common commands

- Generate a migration from `db/schema.sql`:
	- `npm run db:migrate:diff --name init`
- Apply pending migrations:
	- `npm run db:migrate:apply`
- Check migration status:
	- `npm run db:migrate:status`
- Apply schema directly (non-migration flow):
	- `npm run db:schema:apply`
- Quick DB health check via Kysely:
	- `npm run db:check`

### Notes

- Default DB file is `db/app.db`.
- Override DB file for Kysely scripts with `DATABASE_FILE=/path/to/file.db`.
- Atlas uses the `local` environment in `atlas.hcl`.

🚀 What's Inside?
- A clean, minimal Spark environment
- Pre-configured for local development
- Ready to scale with your ideas
  
🧠 What Can You Do?

Right now, this is just a starting point — the perfect place to begin building and testing your Spark applications.

🧹 Just Exploring?
No problem! If you were just checking things out and don’t need to keep this code:

- Simply delete your Spark.
- Everything will be cleaned up — no traces left behind.

📄 License For Spark Template Resources 

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
