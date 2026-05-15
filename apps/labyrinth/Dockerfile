# syntax=docker/dockerfile:1
# Build context: monorepo root
# docker build -f apps/labyrinth/Dockerfile .

# ─── Stage 1: Install dependencies ───────────────────────────────────────────
FROM node:26-bookworm-slim AS deps

RUN npm install -g pnpm@10.30.3

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/labyrinth/package.json apps/labyrinth/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/tsconfig/package.json packages/tsconfig/package.json

RUN pnpm install --frozen-lockfile --ignore-scripts

# ─── Stage 2: Build ──────────────────────────────────────────────────────────
FROM deps AS builder

WORKDIR /app

COPY packages/tsconfig/ packages/tsconfig/
COPY packages/ui/ packages/ui/
COPY apps/labyrinth/ apps/labyrinth/

RUN pnpm run build --filter @pontistudios/ui
RUN pnpm run build --filter @pontistudios/labyrinth

# ─── Stage 3: Production image ───────────────────────────────────────────────
FROM node:26-bookworm-slim AS runner

RUN npm install -g pnpm@10.30.3

ENV NODE_ENV=production
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/labyrinth/package.json apps/labyrinth/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/tsconfig/package.json packages/tsconfig/package.json

RUN pnpm install --frozen-lockfile --prod --ignore-scripts

COPY --from=builder /app/packages/ui/dist packages/ui/dist
COPY --from=builder /app/apps/labyrinth/build apps/labyrinth/build

RUN groupadd -r app && useradd -r -g app app

WORKDIR /app/apps/labyrinth

EXPOSE 3000
ENV PORT=3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode >= 500) throw new Error(r.statusCode)})"

USER app

CMD ["pnpm", "start"]
