# Labyrinth

Ponti Studios portfolio and playground — a pnpm monorepo with two React Router apps: Labs (the portfolio) and What (the daily word game). Puzzles, data visualization, tarot, and experiments.

Local infrastructure is provided by the sibling [Foundation](https://github.com/ponti-studios/foundation)
repository; Labs runs on the host and connects to Foundation's Docker services.
See the [development infrastructure instructions](AGENTS.md#development-infrastructure-foundation-compose)
for the canonical services, ports, and database URLs.

## Layout

| Package | App | Root commands |
| --- | --- | --- |
| `packages/labs` (`@pontistudios/labyrinth`) | Portfolio at `https://labyrinth.lvh.me:4200` | `pnpm labs:dev`, `pnpm build:labs` |
| `packages/what` (`what`) | WH?T daily game at `https://what.lvh.me:4200` | `pnpm game:dev`, `pnpm build:what`, `pnpm game:generate` |
| `packages/db` (`@pontistudios/db`) | Drizzle schema + migrations (shared) | `pnpm db:generate`, `pnpm db:migrate` |
| `packages/ai`, `packages/env` | Shared AI/env helpers | — |

## Getting Started

```bash
# 1. Start foundation (shared infra)
git clone https://github.com/ponti-studios/foundation.git ../foundation
cd ../foundation && just up

# 2. Install and run
cd ../labs
pnpm install

# 3. Start the portless proxy once (unprivileged port, lvh.me so cross-subdomain
#    auth cookies actually work)
pnpm exec portless proxy start --port 4200 --tld lvh.me

# 4. Run the dev servers (or `just dev` for both through portless)
pnpm labs:dev      # Labs on https://labyrinth.lvh.me:4200
pnpm game:dev      # What on https://what.lvh.me:4200
```

Each web app gets a stable `https://<name>.lvh.me:4200` URL instead of a fixed
port — `labyrinth.lvh.me` (Labs) and `what.lvh.me` (What) — configured via the
`"portless"` key in each package's `package.json` (`dev` delegates to
`portless`, the real command is `dev:app`). This is what lets multiple git
worktrees run the dev servers concurrently without port collisions (portless
prefixes each worktree's branch onto the hostname).

Foundation provides:

- PostgreSQL on `localhost:5434` (database: `hominem`)
- PostgreSQL test on `localhost:4433` (database: `hominem-test`)
- Redis on `localhost:6379`
- MinIO on `localhost:9000` (console `localhost:9001`)

Credentials: `postgres` / `postgres` | `minioadmin` / `minioadmin`

## Scripts (repo root)

| Command | Purpose |
| --- | --- |
| `just up` / `just dev` | Portless proxy + both dev servers (see `justfile`) |
| `pnpm labs:dev` | Start Labs dev server at `https://labyrinth.lvh.me:4200` |
| `pnpm game:dev` | Start What dev server at `https://what.lvh.me:4200` |
| `pnpm build` / `pnpm build:labs` | Production build of Labs |
| `pnpm build:what` / `pnpm build:all` | Production build of What / everything |
| `pnpm check` | `lint:check` + full typecheck |
| `pnpm test` | Labs unit tests |
| `pnpm test:game` | What unit tests |
| `pnpm test:shared` | Shared package (`ai`, `db`, `env`) tests |
| `pnpm typecheck` | React Router typegen + `tsc -b` across packages |
| `pnpm db:generate` | Generate Drizzle migration (edit `packages/db/src/schema/` first) |
| `pnpm db:migrate` | Apply Drizzle migrations to `DATABASE_URL` |
| `pnpm game:generate` | Generate What puzzles (gap-fill or `--force`, see docs/what) |
| `pnpm game:ingest` | Poll RSS feeds into the article inventory |
| `pnpm game:health-check` | Verify today's puzzle + forward inventory |
| `pnpm storybook` | Labs Storybook (port 6007; What's is 6008, run inside `packages/what`) |

Package-local scripts (not exposed at the root) run from inside the package,
e.g. `cd packages/what && pnpm game:capture-fixtures`.

## Deployment

Deployed to Railway via `.github/workflows/ci.yml` on production-relevant pushes
to `main`: CI → production migration (`migrate` job) → `deploy-labs` /
`deploy-what` (reusable `reusable-railway-deploy.yml`). Game generation runs
separately from `.github/workflows/game-generate.yml` (daily cron +
`workflow_dispatch`).

Before changing environment values, routes, databases, authentication, or
deployment workflows, read the [core development flows](docs/operations/core-development-flows.md)
and the [deployment and routing lessons](docs/operations/deployment-and-routing.md).
For environment-variable changes, use the [environment configuration contract](docs/operations/environment-configuration.md).