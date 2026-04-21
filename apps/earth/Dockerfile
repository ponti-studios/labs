# syntax=docker/dockerfile:1
# Build context: monorepo root
# docker build -f apps/earth/Dockerfile .

# ─── Stage 1: Install dependencies ───────────────────────────────────────────
FROM node:24-bookworm-slim AS deps

RUN corepack enable && pnpm install -g pnpm@10.30.3

WORKDIR /app

# Copy pnpm workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/earth/package.json apps/earth/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/tsconfig/package.json packages/tsconfig/package.json

# Install dependencies
RUN pnpm install --frozen-lockfile --ignore-scripts

# ─── Stage 2: Build ──────────────────────────────────────────────────────────
FROM deps AS builder

WORKDIR /app

COPY packages/db/ packages/db/
COPY apps/earth/ apps/earth/

RUN pnpm run build --filter @pontistudios/db
RUN pnpm run build --filter @pontistudios/earth

# ─── Stage 3: Production image ───────────────────────────────────────────────
FROM node:24-bookworm-slim AS runner

RUN corepack enable && pnpm install -g pnpm@10.30.3

ENV NODE_ENV=production
WORKDIR /app

# Copy workspace files for pnpm resolution
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/earth/package.json apps/earth/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/tsconfig/package.json packages/tsconfig/package.json

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Copy built artifacts
COPY --from=builder /app/packages/db/dist packages/db/dist
COPY --from=builder /app/apps/earth/dist apps/earth/dist

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
