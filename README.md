# Ponti Studios Monorepo

## Development Ports

### Labs (~/Developer/labs)

| App / Service | Port | URL                   |
| ------------- | ---- | --------------------- |
| Labyrinth     | 3001 | http://localhost:3001 |
| Health        | 3003 | http://localhost:3003 |
| Commune       | 3005 | http://localhost:3005 |
| Earth         | 3006 | http://localhost:3006 |
| UI (package)  | 3007 | (Storybook)           |

### Other Developer Apps (~/Developer)

| App               | Port | URL                   |
| ----------------- | ---- | --------------------- |
| Hominem (API)     | 4040 | http://localhost:4040 |
| Hominem (Finance) | 4444 | http://localhost:4444 |
| Hominem (Notes)   | 4445 | http://localhost:4445 |
| Hominem (Rocco)   | 4446 | http://localhost:4446 |
| Hominem (Workers) | 4447 | http://localhost:4447 |
| Hominem (Desktop) | 5173 | http://localhost:5173 |
| Craftd            | 4451 | http://localhost:4451 |
| Kuma              | 8080 | http://localhost:8080 |
| FortyMac          | 8081 | http://localhost:8081 |
| Jinn              | 4096 | http://localhost:4096 |

## Getting Started

### 1. Start foundation (shared infra)

```bash
# Clone foundation alongside labs
git clone https://github.com/ponti-studios/foundation.git ../foundation

# Start postgres + redis
cd ../foundation && just docker-up
```

Foundation runs:

- PostgreSQL on `localhost:5434`
- PostgreSQL test on `localhost:4433`
- Redis on `localhost:6379`

Credentials: `postgres` / `postgres`

Labs uses the `hominem` PostgreSQL database locally. App tables live under the
`labs` schema inside that database, so `DATABASE_URL` should point to
`postgresql://postgres:postgres@localhost:5434/hominem`.

### 2. Start labs

```bash
cd labs

# Copy env defaults (if starting fresh)
cp env.example .env

# Install dependencies
pnpm install

# Run all dev servers
pnpm dev
```

**Note:** Apps connect to `localhost:5434` (foundation postgres) by default. Do not run `docker compose` from labs — infra lives in foundation.

To start a single app:

```bash
pnpm dev:labyrinth
pnpm dev:commune
pnpm dev:health
pnpm dev:earth
pnpm dev:ui    # Storybook
```

## Apps

- **Labyrinth** (`apps/labyrinth`) — React Router app at port 3001. Real-time puzzle generation, daily challenges, and data visualization.
- **Commune** (`apps/commune`) — React Router app at port 3005. Social relationship voting and community decision-making.
- **Health** (`apps/health`) — React Router app at port 3003. Medical data dashboard and health tracking.
- **Earth** (`apps/earth`) — React Router app at port 3006. Geographic data browser with MapLibre, TfL camera feeds, and location intelligence.

## Packages

- **`@ponti-studios/ui`** — Shared React UI component library (Tailwind, CVA, Storybook at port 3007).
- **`@pontistudios/db`** — Database layer built on Drizzle ORM with PostgreSQL. Schema, migrations, and seed scripts for the shared `labs` database.
- **`@pontistudios/ai`** — AI/LLM utilities wrapping OpenRouter and TanStack AI for multi-model inference.
- **`@pontistudios/tsconfig`** — Shared TypeScript configuration presets.
- **`@pontistudios/db-test`** — Test fixtures, factories, and database helpers for integration tests.
