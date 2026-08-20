# syntax=docker/dockerfile:1

ARG NODE_VERSION=24-bookworm-slim

FROM node:${NODE_VERSION} AS base
WORKDIR /app
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH
RUN corepack enable

FROM base AS builder

# Install dependencies based on the preferred package manager
COPY .npmrc package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install production dependencies first to leverage Docker layer caching
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000

RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates curl && \
    rm -rf /var/lib/apt/lists/* && \
    groupadd --system --gid 1001 app && \
    useradd --system --uid 1001 --gid app --home-dir /app --shell /usr/sbin/nologin app

COPY --from=builder --chown=app:app /app/node_modules ./node_modules
COPY --from=builder --chown=app:app /app/package.json ./package.json
COPY --from=builder --chown=app:app /app/build ./build
COPY --from=builder --chown=app:app /app/app/lib/prompts ./build/server/prompts
COPY --from=builder --chown=app:app /app/app/data/words ./app/data/words

USER app
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f -s -m 2 http://localhost:${PORT}/ || exit 1

CMD ["node_modules/.bin/react-router-serve", "./build/server/index.js"]
