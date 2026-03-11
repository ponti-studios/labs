# syntax=docker/dockerfile:1
# Build context: monorepo root
# docker build -f apps/medico/Dockerfile .

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
COPY apps/medico/package.json           apps/medico/package.json
COPY apps/playground/package.json       apps/playground/package.json
COPY apps/scrape/package.json           apps/scrape/package.json
COPY packages/db/package.json          packages/db/package.json
COPY packages/tailwind-config/package.json packages/tailwind-config/package.json
COPY packages/tsconfig/package.json    packages/tsconfig/package.json
COPY packages/ui/package.json          packages/ui/package.json
COPY packages/utils/package.json       packages/utils/package.json

# npm ci is deterministic and respects the lockfile exactly.
# --ignore-scripts skips postinstall hooks (e.g. lefthook) that don't apply in CI.
RUN npm ci --ignore-scripts --workspace=packages/ui \
 && npm ci --ignore-scripts --workspace=apps/medico


# ─── Stage 2: Build ──────────────────────────────────────────────────────────
FROM deps AS builder

WORKDIR /app

COPY tsconfig.base.json ./
COPY packages/ui/   packages/ui/
COPY apps/medico/   apps/medico/

RUN npm run build --workspace=packages/ui
RUN npm run build --workspace=apps/medico


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
COPY apps/medico/package.json           apps/medico/package.json
COPY apps/playground/package.json       apps/playground/package.json
COPY apps/scrape/package.json           apps/scrape/package.json
COPY packages/db/package.json          packages/db/package.json
COPY packages/tailwind-config/package.json packages/tailwind-config/package.json
COPY packages/tsconfig/package.json    packages/tsconfig/package.json
COPY packages/ui/package.json          packages/ui/package.json
COPY packages/utils/package.json       packages/utils/package.json

RUN npm ci --ignore-scripts --omit=dev --workspace=packages/ui \
 && npm ci --ignore-scripts --omit=dev --workspace=apps/medico

COPY --from=builder /app/packages/ui/dist      packages/ui/dist
COPY --from=builder /app/apps/medico/build      apps/medico/build

WORKDIR /app/apps/medico

EXPOSE 3000
ENV PORT=3000

CMD ["npm", "start"]
