# Labyrinth

Ponti Studios portfolio and playground — React Router app with puzzles, data visualization, tarot, and experiments.

Local infrastructure is provided by the sibling [Foundation](https://github.com/ponti-studios/foundation)
repository; Labs runs on the host and connects to Foundation's Docker services.
See the [development infrastructure instructions](AGENTS.md#development-infrastructure-foundation-compose)
for the canonical services, ports, and database URLs.

## Getting Started

```bash
# 1. Start foundation (shared infra)
git clone https://github.com/ponti-studios/foundation.git ../foundation
cd ../foundation && just up

# 2. Install and run
pnpm install

# 3. Start the portless proxy once (unprivileged port, lvh.me so cross-subdomain
#    auth cookies actually work)
pnpm exec portless proxy start --port 4200 --tld lvh.me

# 4. Run the dev servers
pnpm dev
```

Each web app gets a stable `https://<name>.lvh.me:4200` URL instead of a fixed
port — `labyrinth.lvh.me` (Labs) and `what.lvh.me` (WH?T) — configured via the
`"portless"` key in each package's `package.json` (`dev` delegates to
`portless`, the real command is `dev:app`). This is what lets multiple git
worktrees run `pnpm dev` concurrently without port collisions (portless
prefixes each worktree's branch onto the hostname).

Foundation provides:

- PostgreSQL on `localhost:5434` (database: `hominem`)
- PostgreSQL test on `localhost:4433` (database: `hominem-test`)
- Redis on `localhost:6379`
- MinIO on `localhost:9000`

Credentials: `postgres` / `postgres` | `minioadmin` / `minioadmin`

### Scripts

| Command              | Purpose                      |
| -------------------- | ---------------------------- |
| `pnpm dev`           | Start dev servers at `https://labyrinth.lvh.me:4200` / `https://what.lvh.me:4200` (via portless) |
| `pnpm build`         | Production build             |
| `pnpm start`         | Start production server      |
| `pnpm test`          | Run unit tests               |
| `pnpm test:what`     | Run WH?T-specific tests      |
| `pnpm typecheck`     | Type-check the project       |
| `pnpm lint`          | Lint with oxlint             |
| `pnpm format`        | Format with oxfmt            |
| `pnpm db:generate`   | Generate Drizzle migration   |
| `pnpm db:migrate`    | Apply Drizzle migrations     |
| `pnpm storybook`     | Start Storybook (port 6007)  |
| `pnpm what:generate` | Generate WH?T puzzles        |
| `pnpm search:seed`   | Seed search corpus           |

### Deployment

Deployed to Railway via `.github/workflows/ci.yml` on production-relevant pushes
to `main`.

Before changing environment values, routes, databases, authentication, or
deployment workflows, read the [core development flows](docs/operations/core-development-flows.md)
and the [deployment and routing lessons](docs/operations/deployment-and-routing.md).
For environment-variable changes, use the [environment configuration contract](docs/operations/environment-configuration.md).
