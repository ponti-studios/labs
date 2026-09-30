# Labs

Ponti Studios portfolio and playground — a single React Router app with data visualization, tarot, and experiments. Newsboy is maintained in its own repository and deployed separately.

Local infrastructure is provided by the sibling [Foundation](https://github.com/ponti-studios/foundation)
repository; Labs runs on the host and connects to Foundation's Docker services.
See the [development infrastructure instructions](AGENTS.md#development-infrastructure-foundation-compose)
for the canonical services, ports, and database URLs.

## Layout

| Package | App | Root commands |
| --- | --- | --- |
| `packages/labs` (`labs`) | Labs app at `https://labs.lvh.me`; owns its AI client, env schemas, database schema, and migrations | `pnpm labs:dev`, `pnpm build`, `pnpm db:generate`, `pnpm db:migrate` |

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

# 4. Run the dev servers (or `just dev` for both through portless)
pnpm labs:dev      # Labs on https://labs.lvh.me
```

Labs gets a stable `https://labs.lvh.me` URL instead of a fixed port, configured
via the `"portless"` key in the app package's `package.json` (`dev` delegates to
`portless`, the real command is `dev:app`).

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
| `pnpm build` | Production build of Labs |
| `pnpm check` | `lint:check` + full typecheck |
| `pnpm test` | Labs unit tests |
| `pnpm typecheck` | Labs React Router typegen + TypeScript check |
| `pnpm db:generate` | Generate Drizzle migration (edit `packages/labs/app/lib/server/db/schema/` first) |
| `pnpm db:migrate` | Apply Drizzle migrations to `DATABASE_URL` |
| `pnpm storybook` | Labs Storybook (port 6007) |

## Deployment

Deployed to Railway via `.github/workflows/ci.yml` on production-relevant pushes
to `main`: CI → production migration (`migrate` job) → `deploy-labs` (reusable
`reusable-railway-deploy.yml`). Newsboy deploys and generates from its own repo.

Before changing environment values, routes, databases, authentication, or
deployment workflows, read the [core development flows](docs/operations/core-development-flows.md)
and the [deployment and routing lessons](docs/operations/deployment-and-routing.md).
For environment-variable changes, use the [environment configuration contract](docs/operations/environment-configuration.md).
