# Ponti Studios Monorepo

## Development Ports

### Labs (~/Developer/labs)

| App / Service | Port | URL |
|---------------|------|-----|
| Home (ponti-io) | 3000 | http://localhost:3000 |
| Playground | 3001 | http://localhost:3001 |
| Agent (browser extension) | 3002 | http://localhost:3002 |
| Medico | 3003 | http://localhost:3003 |
| Agent Server | 3004 | http://localhost:3004 |
| Dumphim | 3005 | http://localhost:3005 |
| Earth | 3006 | http://localhost:3006 |
| UI (package) | 3007 | (build tool) |

### Other Developer Apps (~/Developer)

| App | Port | URL |
|-----|------|-----|
| Hominem (API) | 4040 | http://localhost:4040 |
| Hominem (Finance) | 4444 | http://localhost:4444 |
| Hominem (Notes) | 4445 | http://localhost:4445 |
| Hominem (Rocco) | 4446 | http://localhost:4446 |
| Hominem (Workers) | 4447 | http://localhost:4447 |
| Hominem (Desktop) | 5173 | http://localhost:5173 |
| Craftd | 4451 | http://localhost:4451 |
| Kuma | 8080 | http://localhost:8080 |
| FortyMac | 8081 | http://localhost:8081 |
| Jinn | 4096 | http://localhost:4096 |

## Getting Started

```bash
# Install dependencies
npm install

# Run all dev servers
npm run dev

# Run a specific app
npm run dev:earth
npm run dev:playground
```

## Apps (Labs)

- **ponti-io** - Main studio homepage (Next.js)
- **playground** - React Router app for experiments
- **medico** - Medical-related React Router app
- **earth** - Earth intelligence dashboard (Svelte + Cesium)
- **agent** - Browser extension (WXT)
- **agent-server** - Agent backend server (Bun/Hono)
- **dumphim** - Dumphim app (React Router)
- **ui** - Shared UI component package

## Packages

- **@pontistudios/ui** - Shared React UI components
- **@pontistudios/utils** - Shared utilities
- **@pontistudios/db** - Database utilities
- **tailwind-config** - Shared Tailwind configuration
