# syntax=docker/dockerfile:1
# Build context: monorepo root
# docker build -f apps/dumphim/Dockerfile .

# ─── Stage 1: Install dependencies ───────────────────────────────────────────
FROM node:25-bookworm-slim AS deps

# npm 11.x has a bug with workspace-deduplication entries in lockfile v3.
# Pin to 10.x until the upstream fix lands.
RUN npm install -g npm@10.9.2 --quiet

WORKDIR /app

# Copy ALL workspace package.json files so npm can resolve the full workspace
# link graph from the lockfile without missing-directory errors.
COPY package.json package-lock.json ./
COPY apps/dumphim/package.json          apps/dumphim/package.json
COPY apps/earth/package.json            apps/earth/package.json
COPY apps/manual-co/package.json        apps/manual-co/package.json
COPY apps/playground/package.json       apps/playground/package.json
COPY apps/scrape/package.json           apps/scrape/package.json
COPY extensions/polly/package.json      extensions/polly/package.json
COPY extensions/uber-eats-tracker/package.json extensions/uber-eats-tracker/package.json
COPY extensions/youtube/package.json    extensions/youtube/package.json
COPY packages/db/package.json          packages/db/package.json
COPY packages/tailwind-config/package.json packages/tailwind-config/package.json
COPY packages/tsconfig/package.json    packages/tsconfig/package.json
COPY packages/ui/package.json          packages/ui/package.json
COPY packages/utils/package.json       packages/utils/package.json

# npm ci is deterministic and respects the lockfile exactly.
# --ignore-scripts skips postinstall hooks (e.g. lefthook) that don't apply in CI.
RUN npm ci --ignore-scripts --workspace=packages/db \
 && npm ci --ignore-scripts --workspace=packages/ui \
 && npm ci --ignore-scripts --workspace=packages/utils \
 && npm ci --ignore-scripts --workspace=apps/dumphim


# ─── Stage 2: Build ──────────────────────────────────────────────────────────
FROM deps AS builder

WORKDIR /app

COPY tsconfig.base.json ./
COPY packages/tsconfig/ packages/tsconfig/
COPY packages/db/       packages/db/
COPY packages/ui/       packages/ui/
COPY packages/utils/    packages/utils/
COPY apps/dumphim/      apps/dumphim/

RUN npm run build --workspace=packages/db
RUN npm run build --workspace=packages/ui
RUN npm run build --workspace=packages/utils
RUN npm run build --workspace=apps/dumphim


# ─── Stage 3: Production image ───────────────────────────────────────────────
FROM node:25-bookworm-slim AS runner

# Pin npm to same version as build stages.
RUN npm install -g npm@10.9.2 --quiet

ENV NODE_ENV=production
WORKDIR /app

# Copy ALL workspace manifests so npm can resolve the link graph.
COPY package.json package-lock.json ./
COPY apps/dumphim/package.json          apps/dumphim/package.json
COPY apps/earth/package.json            apps/earth/package.json
COPY apps/manual-co/package.json        apps/manual-co/package.json
COPY apps/playground/package.json       apps/playground/package.json
COPY apps/scrape/package.json           apps/scrape/package.json
COPY extensions/polly/package.json      extensions/polly/package.json
COPY extensions/uber-eats-tracker/package.json extensions/uber-eats-tracker/package.json
COPY extensions/youtube/package.json    extensions/youtube/package.json
COPY packages/db/package.json          packages/db/package.json
COPY packages/tailwind-config/package.json packages/tailwind-config/package.json
COPY packages/tsconfig/package.json    packages/tsconfig/package.json
COPY packages/ui/package.json          packages/ui/package.json
COPY packages/utils/package.json       packages/utils/package.json

# tsx is a devDependency but the start script requires it at runtime.
# Install all deps (including dev) for dumphim only to get tsx, omit dev elsewhere.
RUN npm ci --ignore-scripts --omit=dev --workspace=packages/db \
 && npm ci --ignore-scripts --omit=dev --workspace=packages/ui \
 && npm ci --ignore-scripts --omit=dev --workspace=packages/utils \
 && npm ci --ignore-scripts --workspace=apps/dumphim

# Copy built artifacts from the builder stage.
COPY --from=builder /app/packages/db/dist      packages/db/dist
COPY --from=builder /app/packages/ui/dist      packages/ui/dist
COPY --from=builder /app/packages/utils/dist   packages/utils/dist
COPY --from=builder /app/apps/dumphim/build    apps/dumphim/build
COPY --from=builder /app/apps/dumphim/server.ts apps/dumphim/server.ts

WORKDIR /app/apps/dumphim

EXPOSE 3000
ENV PORT=3000

CMD ["npm", "start"]
