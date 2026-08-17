# Labyrinth

Ponti Studios portfolio and playground — React Router app with puzzles, data visualization, tarot, and experiments.

## Getting Started

```bash
# 1. Start foundation (shared infra)
git clone https://github.com/ponti-studios/foundation.git ../foundation
cd ../foundation && just up

# 2. Install and run
pnpm install
pnpm dev
```

Foundation provides:

- PostgreSQL on `localhost:5434` (database: `hominem`)
- PostgreSQL test on `localhost:4433` (database: `labs-test`)
- Redis on `localhost:6379`
- MinIO on `localhost:9000`

Credentials: `postgres` / `postgres` | `minioadmin` / `minioadmin`

### Scripts

| Command              | Purpose                      |
| -------------------- | ---------------------------- |
| `pnpm dev`           | Start dev server (port 3001) |
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

Deployed to Railway via `.github/workflows/deploy-playground-prod.yml` on push to `main`.
