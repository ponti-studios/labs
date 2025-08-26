#!/bin/bash

# Docker startup script for Rocco development environment

set -e

echo "🐳 Starting Rocco development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created. Please update it with your Supabase credentials."
fi

# Start Docker services
echo "🚀 Starting PostgreSQL and Redis..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if services are running
echo "🔍 Checking service status..."

if docker-compose ps | grep -q "Up"; then
    echo "✅ Services are running!"
    echo ""
    echo "📊 Service URLs:"
    echo "  PostgreSQL: localhost:5432"
    echo "  Redis: localhost:6379"
    echo "  Redis Commander: http://localhost:8081"
    echo ""
    echo "🔑 Default credentials:"
    echo "  PostgreSQL: rocco/rocco_password"
    echo "  Redis: redis_password"
    echo ""
    echo "📝 Next steps:"
    echo "  1. Update .env file with your Supabase credentials"
    echo "  2. Run 'pnpm db:push' to set up the database schema"
    echo "  3. Run 'pnpm dev' to start the development server"
else
    echo "❌ Services failed to start. Check the logs with 'docker-compose logs'"
    exit 1
fi 