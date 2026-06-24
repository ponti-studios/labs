# syntax=docker/dockerfile:1

ARG NODE_VERSION=24-bookworm-slim

FROM node:${NODE_VERSION} AS base
WORKDIR /app
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH
RUN corepack enable

FROM base AS builder

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/labyrinth/package.json apps/labyrinth/package.json
COPY packages/ai/package.json packages/ai/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/tsconfig/package.json packages/tsconfig/package.json
COPY tsconfig.base.json ./
COPY packages/tsconfig/ packages/tsconfig/
COPY packages/ai/ packages/ai/
COPY packages/db/ packages/db/
COPY packages/ui/ packages/ui/
COPY apps/labyrinth/ apps/labyrinth/

RUN pnpm install --frozen-lockfile --filter @pontistudios/labyrinth...
RUN pnpm --filter @pontistudios/db build
RUN pnpm --filter @pontistudios/labyrinth build
RUN pnpm deploy --legacy --filter @pontistudios/labyrinth --prod /prod/labyrinth

FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000

RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates curl && \
    rm -rf /var/lib/apt/lists/* && \
    groupadd --system --gid 1001 app && \
    useradd --system --uid 1001 --gid app --home-dir /app --shell /usr/sbin/nologin app

COPY --from=builder --chown=app:app /prod/labyrinth/node_modules ./node_modules
COPY --from=builder --chown=app:app /prod/labyrinth/package.json ./package.json
COPY --from=builder --chown=app:app /app/apps/labyrinth/build ./build
COPY --from=builder --chown=app:app /app/apps/labyrinth/app/lib/prompts ./build/server/prompts
COPY --from=builder --chown=app:app /app/apps/labyrinth/app/data/words ./build/data/words

USER app
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f -s -m 2 http://localhost:${PORT}/ || exit 1

CMD ["node_modules/.bin/react-router-serve", "./build/server/index.js"]
