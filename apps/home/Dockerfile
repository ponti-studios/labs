# Base stage with common tools
FROM node:23.11-bookworm-slim AS base

# Add labels for better metadata
LABEL maintainer="ponti-io"
LABEL version="1.0"
LABEL description="ponti-studios homepage"

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

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
        build-essential \
        node-gyp \
        pkg-config \
        python-is-python3 \
        ca-certificates && \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

# Install node modules (copy package files first for better caching)
COPY package.json package-lock.json* ./
RUN npm ci --include=dev --legacy-peer-deps --ignore-scripts && \
    npm cache clean --force

# Build stage
FROM base AS builder

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application code
COPY . .

# Install build dependencies
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
        build-essential \
        node-gyp \
        pkg-config \
        python-is-python3 && \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

# Accept build arguments for Next.js public environment variables
ARG PORT=3000
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ARG NEXT_PUBLIC_SHOW_LOGGER=false

# Set build-time environment variables (only public ones)
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ENV NEXT_PUBLIC_SHOW_LOGGER=$NEXT_PUBLIC_SHOW_LOGGER
ENV PORT=$PORT

# Set a placeholder DATABASE_URL for build time (won't be used during build with our lazy loading)
ENV DATABASE_URL="postgresql://placeholder:placeholder@placeholder:5432/placeholder"

# Build application
RUN npm run build

# Production stage
FROM base AS runner

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
