# This service is deployed as an application server, with its own runtime and database client.
# The repository root is the build context so this service can consume shared workspace packages.
FROM node:24-alpine AS build

WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
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

FROM node:24-alpine

WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/what/package.json ./packages/what/package.json
COPY --from=build /app/packages/what/node_modules ./packages/what/node_modules
COPY --from=build /app/packages/what/build ./packages/what/build
# The compiled server resolves this asset relative to build/server, which
# points at /app/packages/data at runtime.
COPY --from=build /app/packages/what/src/data ./packages/data

WORKDIR /app/packages/what
CMD ["./node_modules/.bin/react-router-serve", "build/server/index.js"]
