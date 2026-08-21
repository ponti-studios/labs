ARG NODE_VERSION=24-bookworm-slim

FROM node:${NODE_VERSION} AS base

WORKDIR /app
ENV PNPM_HOME=/pnpm \
	PATH=/pnpm:$PATH \
	CI=true
RUN corepack enable

FROM base AS build

COPY .npmrc package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ai/package.json packages/ai/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/env/package.json packages/env/package.json
COPY packages/what/package.json packages/what/package.json
RUN pnpm install --frozen-lockfile --config.minimum-release-age=0 --filter what...
COPY packages/ai packages/ai
COPY packages/db packages/db
COPY packages/env packages/env
COPY packages/what packages/what
RUN pnpm --filter what build

FROM node:${NODE_VERSION} AS runner

WORKDIR /app
ENV NODE_ENV=production \
	PORT=3000

RUN apt-get update && \
	apt-get install -y --no-install-recommends ca-certificates curl && \
	rm -rf /var/lib/apt/lists/* && \
	groupadd --system --gid 1001 app && \
	useradd --system --uid 1001 --gid app --home-dir /app --shell /usr/sbin/nologin app

COPY --from=build --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/packages/what/package.json ./packages/what/package.json
COPY --from=build --chown=app:app /app/packages/what/node_modules ./packages/what/node_modules
COPY --from=build --chown=app:app /app/packages/what/build ./packages/what/build
# The compiled server resolves this asset relative to build/server, which
# points at /app/packages/data at runtime.
COPY --from=build --chown=app:app /app/packages/what/src/data ./packages/data

WORKDIR /app/packages/what
USER app
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
	CMD curl -f -s -m 2 http://localhost:${PORT}/healthz || exit 1

CMD ["./node_modules/.bin/react-router-serve", "./build/server/index.js"]
