# syntax=docker/dockerfile:1
# Build context: monorepo root
# docker build -f apps/earth/Dockerfile .

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
COPY extensions/polly/package.json      extensions/polly/package.json
COPY extensions/uber-eats-tracker/package.json extensions/uber-eats-tracker/package.json
COPY extensions/youtube/package.json    extensions/youtube/package.json
COPY packages/db/package.json          packages/db/package.json
COPY packages/tailwind-config/package.json packages/tailwind-config/package.json
COPY packages/tsconfig/package.json    packages/tsconfig/package.json
COPY packages/ui/package.json          packages/ui/package.json
COPY packages/utils/package.json       packages/utils/package.json

RUN npm ci --ignore-scripts --workspace=packages/db \
 && npm ci --ignore-scripts --workspace=apps/earth


# ─── Stage 2: Build ──────────────────────────────────────────────────────────
FROM deps AS builder

WORKDIR /app

COPY tsconfig.base.json ./
COPY packages/db/       packages/db/
COPY apps/earth/        apps/earth/

RUN npm run build --workspace=packages/db
RUN npm run build --workspace=apps/earth


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
COPY extensions/polly/package.json      extensions/polly/package.json
COPY extensions/uber-eats-tracker/package.json extensions/uber-eats-tracker/package.json
COPY extensions/youtube/package.json    extensions/youtube/package.json
COPY packages/db/package.json          packages/db/package.json
COPY packages/tailwind-config/package.json packages/tailwind-config/package.json
COPY packages/tsconfig/package.json    packages/tsconfig/package.json
COPY packages/ui/package.json          packages/ui/package.json
COPY packages/utils/package.json       packages/utils/package.json

RUN npm ci --ignore-scripts --omit=dev --workspace=packages/db \
 && npm ci --ignore-scripts --omit=dev --workspace=apps/earth

# Copy built artifacts from builder stage.
COPY --from=builder /app/packages/db/dist      packages/db/dist
COPY --from=builder /app/apps/earth/dist        apps/earth/dist

# Create non-root user for security
RUN groupadd -r app && useradd -r -g app app

WORKDIR /app/apps/earth

EXPOSE 3000
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

USER app

# Serve the built Vite SPA from dist/
CMD ["node", "-e", "const http = require('http'); const fs = require('fs'); const path = require('path'); const distPath = '/app/apps/earth/dist'; const server = http.createServer((req, res) => { let filePath = path.join(distPath, req.url === '/' ? 'index.html' : req.url); if (!fs.existsSync(filePath)) filePath = path.join(distPath, 'index.html'); fs.readFile(filePath, (err, data) => { if (err) { res.writeHead(404); res.end('Not Found'); } else { const ext = path.extname(filePath); const mimeTypes = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.woff': 'font/woff', '.woff2': 'font/woff2' }; res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream', 'Cache-Control': filePath.includes('dist/assets') ? 'public, max-age=31536000' : 'no-cache' }); res.end(data); } }); }); server.listen(3000, () => console.log('Server running on port 3000'));"]
