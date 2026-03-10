#!/bin/bash

# Startup script for Railway deployment
# Runs migrations and then starts the server

set -e

echo "🚀 Starting Dumphim..."

# Run database migrations
echo "🔄 Running database migrations..."
if npx drizzle-kit migrate; then
  echo "✅ Migrations complete"
else
  echo "⚠️  Migration warning (may be already applied or error)"
fi

# Start the server
echo "🌐 Starting server..."
exec pnpm start