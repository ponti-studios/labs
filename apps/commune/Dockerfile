# syntax=docker/dockerfile:1

ARG NODE_VERSION=24-bookworm-slim

FROM node:${NODE_VERSION} AS base
WORKDIR /app
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH
RUN corepack enable

FROM base AS builder

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/commune/package.json apps/commune/package.json
COPY packages/ai/package.json packages/ai/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/tsconfig/package.json packages/tsconfig/package.json
COPY tsconfig.base.json ./
COPY packages/tsconfig/ packages/tsconfig/
COPY packages/ai/ packages/ai/
COPY packages/db/ packages/db/
COPY packages/ui/ packages/ui/
COPY apps/commune/ apps/commune/

RUN pnpm install --frozen-lockfile --filter @pontistudios/commune...
RUN pnpm --filter @pontistudios/db build
RUN pnpm --filter @pontistudios/commune build
RUN pnpm deploy --legacy --filter @pontistudios/commune --prod /prod/commune

FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000

RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates curl && \
    rm -rf /var/lib/apt/lists/* && \
    groupadd --system --gid 1001 app && \
    useradd --system --uid 1001 --gid app --home-dir /app --shell /usr/sbin/nologin app

COPY --from=builder --chown=app:app /prod/commune/node_modules ./node_modules
COPY --from=builder --chown=app:app /prod/commune/package.json ./package.json
COPY --from=builder --chown=app:app /app/apps/commune/build ./build

USER app
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f -s -m 2 http://localhost:${PORT}/api/health || exit 1

CMD ["node_modules/.bin/react-router-serve", "./build/server/index.js"]
