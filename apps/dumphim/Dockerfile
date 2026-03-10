FROM node:22-alpine AS base

FROM base AS deps
RUN corepack enable && corepack prepare pnpm@9.7.1 --activate
WORKDIR /app
COPY pnpm-workspace.yaml package.json ./
COPY apps/dumphim/package.json apps/dumphim/
COPY packages/db/package.json packages/db/
COPY packages/ui/package.json packages/ui/
COPY packages/utils/package.json packages/utils/
RUN pnpm install --frozen-lockfile --prod=false

FROM base AS builder
RUN corepack enable && corepack prepare pnpm@9.7.1 --activate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter dumphim run build

FROM base AS runner
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@9.7.1 --activate
WORKDIR /app
COPY --from=builder /app/apps/dumphim/build ./build
COPY --from=builder /app/apps/dumphim/package.json ./package.json
COPY --from=builder /app/node_modules/.pnpm ./node_modules/.pnpm
COPY --from=deps /app/node_modules ./
RUN pnpm install --frozen-lockfile --prod

EXPOSE 3000
ENV PORT=3000
CMD ["pnpm", "start"]
