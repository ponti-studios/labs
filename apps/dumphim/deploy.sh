#!/bin/bash

# Production Deployment Script for Dumphim
# Usage: ./deploy.sh [platform]
# Platforms: vercel, railway, render

set -e

PLATFORM=${1:-vercel}
APP_DIR="apps/dumphim"

echo "🚀 Deploying Dumphim to $PLATFORM..."

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "$APP_DIR" ]; then
  echo "❌ Error: Must run from monorepo root"
  exit 1
fi

# Check environment variables
check_env() {
  if [ -f "$APP_DIR/.env.production" ]; then
    echo "✓ Production environment file found"
  else
    echo "⚠️  Warning: .env.production not found"
    echo "   Create it from .env.production.example"
  fi
}

# Run pre-deployment checks
pre_deploy() {
  echo "🔍 Running pre-deployment checks..."
  
  # Type check
  echo "  → Type checking..."
  cd $APP_DIR && npm run typecheck > /dev/null 2>&1 && echo "  ✓ Type check passed" || { echo "  ❌ Type check failed"; exit 1; }
  cd ../..
  
  # Build check
  echo "  → Building..."
  cd $APP_DIR && npm run build > /dev/null 2>&1 && echo "  ✓ Build passed" || { echo "  ❌ Build failed"; exit 1; }
  cd ../..
  
  echo "✅ All checks passed!"
}

deploy_vercel() {
  echo "📦 Deploying to Vercel..."
  
  if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm i -g vercel
  fi
  
  cd $APP_DIR
  vercel --prod
  cd ../..
}

deploy_railway() {
  echo "🚂 Deploying to Railway..."
  
  if ! command -v railway &> /dev/null; then
    echo "Installing Railway CLI..."
    npm i -g @railway/cli
  fi
  
  # Check if logged in
  railway whoami > /dev/null 2>&1 || { echo "❌ Not logged in. Run: railway login"; exit 1; }
  
  cd $APP_DIR
  railway up
  cd ../..
}

deploy_render() {
  echo "🎨 Deploying to Render..."
  
  if ! command -v render &> /dev/null; then
    echo "Installing Render CLI..."
    npm i -g @render/cli
  fi
  
  cd $APP_DIR
  
  # Check if render.yaml exists
  if [ ! -f "render.yaml" ]; then
    echo "❌ render.yaml not found"
    exit 1
  fi
  
  echo "Pushing to GitHub..."
  git add -A
  git commit -m "Prepare for Render deployment" || true
  git push
  
  echo "✅ Pushed to GitHub. Render will auto-deploy."
  echo "   Monitor at: https://dashboard.render.com"
  
  cd ../..
}

# Main deployment flow
case $PLATFORM in
  vercel)
    check_env
    pre_deploy
    deploy_vercel
    ;;
  railway)
    check_env
    pre_deploy
    deploy_railway
    ;;
  render)
    check_env
    pre_deploy
    deploy_render
    ;;
  *)
    echo "Usage: ./deploy.sh [vercel|railway|render]"
    exit 1
    ;;
esac

echo ""
echo "🎉 Deployment initiated!"
echo "📖 Next steps:"
echo "   1. Set environment variables in your platform dashboard"
echo "   2. Run database migrations"
echo "   3. Verify deployment at your app's URL"
echo ""
echo "   See DEPLOYMENT.md for detailed instructions."