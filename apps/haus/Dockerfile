# Base stage with common tools
FROM node:24-bookworm-slim AS base

# Add labels for better metadata
LABEL maintainer="@pontistudios/home"
LABEL version="1.0"
LABEL description="@pontistudios/home"

# Next.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN groupadd --gid 1001 --system nodejs && \
    useradd --uid 1001 --system --gid nodejs --create-home --shell /bin/bash nextjs

# Throw-away build stage to reduce size of final image
FROM base AS deps

RUN corepack enable && pnpm install -g pnpm@10.30.3

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
        build-essential \
        node-gyp \
        pkg-config \
        python-is-python3 \
        ca-certificates && \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/home/package.json apps/home/package.json

# Install dependencies
RUN pnpm install --frozen-lockfile --ignore-scripts

# Build stage
FROM base AS builder

WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/home/package.json apps/home/package.json

# Copy application code
COPY . .

# Accept build arguments for Next.js public environment variables
ARG PORT=3000
ARG NEXT_PUBLIC_SHOW_LOGGER=false

# Set build-time environment variables (only public ones)
ENV NEXT_PUBLIC_SHOW_LOGGER=$NEXT_PUBLIC_SHOW_LOGGER
ENV PORT=$PORT

# Set a placeholder DATABASE_URL for build time
ENV DATABASE_URL="postgresql://placeholder:placeholder@placeholder:5432/placeholder"

# Build application
RUN pnpm run build

# Production stage
FROM base AS runner

RUN corepack enable && pnpm install -g pnpm@10.30.3

# Install runtime dependencies including PostgreSQL client
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
        postgresql-client \
        ca-certificates \
        curl \
        dumb-init && \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

# Don't run production as root
USER nextjs

# Copy the built application from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/start.sh ./start.sh

# Make start script executable
RUN chmod +x ./start.sh

# Unset the placeholder DATABASE_URL so the real one from runtime takes precedence
ENV DATABASE_URL=""

# Ensure Next.js binds to all interfaces
ENV HOSTNAME="0.0.0.0"

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:$PORT/api/health || exit 1

# Expose port
EXPOSE ${PORT:-3000}

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the server and bind to all interfaces
CMD ["./start.sh"]
