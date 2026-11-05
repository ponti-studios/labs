# Labs

Ponti Studios portfolio and playground — a single React Router app with data visualization, tarot, and experiments. Newsboy is maintained in its own repository and deployed separately.

Local infrastructure is provided by the sibling [Foundation](https://github.com/ponti-studios/foundation)
repository. Labs runs on the host; Hominem owns PostgreSQL data and migrations.

Labs is a single pnpm app at the repository root. It owns its AI client and
environment schemas. Newsboy is maintained in its own repository and deployed
separately.

## Getting Started

```bash
# 1. Start the local Foundation services needed by Labs
git clone https://github.com/ponti-studios/foundation.git ../foundation
cd ../foundation && just up

# 2. Install and run
cd ../labs
pnpm install

# 3. Start the portless proxy once (HTTPS on port 443, lvh.me so cross-subdomain
#    auth cookies actually work; elevates with sudo to bind 443)
pnpm exec portless proxy start --port 443 --tld lvh.me

# 4. Run Labs through portless (or `just dev`)
pnpm dev           # Labs on https://labs.lvh.me
```

Labs gets a stable `https://labs.lvh.me` URL instead of a fixed port, configured
via the `"portless"` key in the root `package.json` (`dev` delegates to
`portless`, the app server command is `dev:app`).

Foundation provides Redis on `localhost:6379` and MinIO on `localhost:9000`
(console `localhost:9001`).

## Scripts (repo root)

| Command                | Purpose                                           |
| ---------------------- | ------------------------------------------------- |
| `just up` / `just dev` | Portless proxy + Labs dev server (see `justfile`) |
| `pnpm dev`             | Start Labs dev server at `https://labs.lvh.me`    |
| `pnpm build`           | Production build of Labs                          |
| `pnpm check`           | `lint:check` + full typecheck                     |
| `pnpm test`            | Labs unit tests                                   |
| `pnpm typecheck`       | Labs React Router typegen + TypeScript check      |
| `pnpm storybook`       | Labs Storybook (port 6007)                        |

## Deployment

Deployed to Fly via `.github/workflows/ci.yml` on production-relevant pushes
to `main`: CI and build → `deploy-labs` (reusable
`reusable-fly-deploy.yml`). The checked-in `fly.toml` targets the existing
`hominem-labs` app. GitHub Actions needs the app-scoped `FLY_API_TOKEN` secret.
Labs Actions do not run database migrations; Hominem owns that pipeline.
Newsboy deploys and generates from its own repo.

Before changing environment values, routes, databases, authentication, or
deployment workflows, read the [core development flows](docs/operations/core-development-flows.md)
and the [deployment and routing lessons](docs/operations/deployment-and-routing.md).
For environment-variable changes, use the [environment configuration contract](docs/operations/environment-configuration.md).
