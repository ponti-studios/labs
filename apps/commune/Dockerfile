# syntax=docker/dockerfile:1
# Build context: monorepo root
# docker build -f apps/social/Dockerfile .

# ─── Stage 1: Install dependencies ───────────────────────────────────────────
FROM node:24-bookworm-slim AS deps

RUN corepack enable && pnpm install -g pnpm@10.30.3

WORKDIR /app

# Copy pnpm workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/social/package.json apps/social/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/tsconfig/package.json packages/tsconfig/package.json

# Install dependencies
RUN pnpm install --frozen-lockfile --ignore-scripts

# ─── Stage 2: Build ──────────────────────────────────────────────────────────
FROM deps AS builder

WORKDIR /app

COPY tsconfig.base.json ./
COPY packages/tsconfig/ packages/tsconfig/
COPY packages/db/ packages/db/
COPY packages/ui/ packages/ui/
COPY apps/social/ apps/social/

RUN pnpm run build --filter @pontistudios/db
RUN pnpm run build --filter @pontistudios/ui
RUN pnpm run build --filter @pontistudios/social

# ─── Stage 3: Production image ───────────────────────────────────────────────
FROM node:24-bookworm-slim AS runner

RUN corepack enable && pnpm install -g pnpm@10.30.3

ENV NODE_ENV=production
WORKDIR /app

# Copy workspace files for pnpm resolution
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/social/package.json apps/social/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/tsconfig/package.json packages/tsconfig/package.json

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Copy built artifacts
COPY --from=builder /app/packages/db/dist packages/db/dist
COPY --from=builder /app/packages/ui/dist packages/ui/dist
COPY --from=builder /app/apps/social/build apps/social/build
COPY --from=builder /app/apps/social/server.ts apps/social/server.ts

WORKDIR /app/apps/social

EXPOSE 3000
ENV PORT=3000

CMD ["pnpm", "start"]
