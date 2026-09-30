# Labs

Ponti Studios portfolio and playground — a pnpm monorepo for Labs (the portfolio), shared packages, and experiments. Newsboy is maintained in its [own repository](https://github.com/ponti-studios/newsboy).

Local infrastructure is provided by the sibling [Foundation](https://github.com/ponti-studios/foundation)
repository; Labs runs on the host and connects to Foundation's Docker services.
See the [development infrastructure instructions](AGENTS.md#development-infrastructure-foundation-compose)
for the canonical services, ports, and database URLs.

## Layout

| Package | App | Root commands |
| --- | --- | --- |
| `packages/labs` (`labs`) | Portfolio at `https://labs.lvh.me` | `pnpm labs:dev`, `pnpm build:labs` |
| [Newsboy](https://github.com/ponti-studios/newsboy) | Daily game at `https://newsboy.ponti.io` | Follow its repository README |
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

# 3. Start the portless proxy once (HTTPS on port 443, lvh.me so cross-subdomain
#    auth cookies actually work; elevates with sudo to bind 443)
pnpm exec portless proxy start --port 443 --tld lvh.me

# 4. Run the Labs dev server (or `just dev` through portless)
pnpm labs:dev      # Labs on https://labs.lvh.me
```

Labs gets a stable `https://labs.lvh.me` URL instead of a fixed port, configured
via the `"portless"` key in `packages/labs/package.json` (`dev` delegates to
`portless`, the real command is `dev:app`). Newsboy's local development setup is
documented in its own repository.

Foundation provides:

- PostgreSQL on `localhost:5434` (database: `hominem`)
- PostgreSQL test on `localhost:4433` (database: `hominem-test`)
- Redis on `localhost:6379`
- MinIO on `localhost:9000` (console `localhost:9001`)

Credentials: `postgres` / `postgres` | `minioadmin` / `minioadmin`

## Scripts (repo root)

| Command | Purpose |
| --- | --- |
| `just up` / `just dev` | Portless proxy + Labs dev server (see `justfile`) |
| `pnpm labs:dev` | Start Labs dev server at `https://labs.lvh.me` |
| `pnpm build` / `pnpm build:labs` | Production build of Labs |
| `pnpm build:all` | Production build of all Labs-owned apps |
| `pnpm check` | `lint:check` + full typecheck |
| `pnpm test` | Labs unit tests |
| `pnpm test:shared` | Shared package (`ai`, `db`, `env`) tests |
| `pnpm typecheck` | Labs React Router typegen + `tsc -b` across Labs-owned packages |
| `pnpm db:generate` | Generate Drizzle migration (edit `packages/db/src/schema/` first) |
| `pnpm db:migrate` | Apply Drizzle migrations to `DATABASE_URL` |
| `pnpm storybook` | Labs Storybook (port 6007) |

## Deployment

Labs deploys to Railway via `.github/workflows/ci.yml` on production-relevant
pushes to `main`: CI → production migration (`migrate` job) → `deploy-labs`.
Newsboy app deployments and generation workflows are owned by the standalone
Newsboy repository. The database schema and migration chain remain in Labs;
Newsboy pins shared package code to a Labs commit and its Railway pre-deploy
check blocks app activation until that commit's migrations are recorded.

Before changing environment values, routes, databases, authentication, or
deployment workflows, read the [core development flows](docs/operations/core-development-flows.md)
and the [deployment and routing lessons](docs/operations/deployment-and-routing.md).
For environment-variable changes, use the [environment configuration contract](docs/operations/environment-configuration.md).
