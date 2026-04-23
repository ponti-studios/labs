# Ponti Studios Monorepo

## Development Ports

### Labs (~/Developer/labs)

| App / Service | Port | URL                   |
| ------------- | ---- | --------------------- |
| Home          | 3000 | http://localhost:3000 |
| Playground    | 3001 | http://localhost:3001 |
| Health        | 3003 | http://localhost:3003 |
| Social       | 3005 | http://localhost:3005 |
| Earth         | 3006 | http://localhost:3006 |
| UI (package)  | 3007 | (build tool)          |

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

## Apps

- **home** - Main studio homepage (Next.js)
- **playground** - React Router app for experiments
- **health** - Medical-related React Router app
- **earth** - Earth intelligence dashboard (Svelte + Cesium)
- **social** - Social app (React Router)
- **ui** - Shared UI component package

## Packages

- **@pontistudios/ui** - Shared React UI components
- **@pontistudios/utils** - Shared utilities
- **@pontistudios/db** - Database utilities
