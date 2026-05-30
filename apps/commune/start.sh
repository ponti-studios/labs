#!/bin/bash

# Startup script for Railway deployment
# Runs migrations and then starts the server

set -e

echo "Starting Commune..."

# Run database migrations
echo "Running database migrations..."
if npx drizzle-kit migrate; then
  echo "Migrations complete"
else
  echo "Migration warning (may be already applied or non-fatal error)"
fi

# Start the server
echo "Starting server..."
exec npm start
