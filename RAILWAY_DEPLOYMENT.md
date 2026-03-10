# 🚂 Railway Deployment Guide

## Prerequisites

1. Railway account (sign up at railway.app)
2. Railway CLI installed
3. Git repository (GitHub, GitLab, or Bitbucket)

## Step-by-Step Deployment

### 1. Install Railway CLI

```bash
npm i -g @railway/cli
```

### 2. Login to Railway

```bash
railway login
```

This will open a browser window for authentication.

### 3. Initialize Project

From the monorepo root:

```bash
# Create a new project
railway init

# Select "New Project" and give it a name (e.g., "dumphim")
```

### 4. Add PostgreSQL Database

```bash
railway add --database postgres
```

This will:
- Create a PostgreSQL database
- Add the `DATABASE_URL` environment variable automatically
- Set up backups

### 5. Set JWT_SECRET

Generate a secure secret:

```bash
openssl rand -base64 32
```

Set it in Railway:

```bash
railway variables set JWT_SECRET="your-generated-secret"
```

### 6. Deploy

```bash
railway up
```

This will:
- Build the Docker image
- Deploy the app
- Start the server

### 7. Run Database Migrations

After deployment, run migrations:

```bash
railway run pnpm run db:migrate
```

Or connect to the service and run:

```bash
railway connect
# Then run:
pnpm run db:migrate
```

### 8. Verify Deployment

Check deployment status:

```bash
railway status
```

View logs:

```bash
railway logs
```

Open the app:

```bash
railway open
```

## Environment Variables

Required variables:

| Variable | Description | Source |
|----------|-------------|--------|
| `DATABASE_URL` | PostgreSQL connection | Auto-set by Railway |
| `JWT_SECRET` | JWT signing secret | You generate |
| `NODE_ENV` | Environment | Set to `production` |
| `PORT` | Port to run on | Railway sets this (default 3000) |

Optional variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `REDIS_URL` | Redis for caching | (none) |
| `SENTRY_DSN` | Error tracking | (none) |

## Volume (File Uploads)

Railway provides ephemeral storage by default. For persistent file uploads, you need to add a volume:

1. Go to Railway Dashboard → Your Service → Volumes
2. Click "New Volume"
3. Mount path: `/app/public/uploads`
4. Size: 5GB (or more)

## Production Checklist

- [ ] Database created and migrations run
- [ ] JWT_SECRET is strong and unique
- [ ] Environment variables set
- [ ] Volume mounted for uploads (optional)
- [ ] Health check endpoint working
- [ ] SSL/HTTPS enabled (Railway provides this)
- [ ] Custom domain configured (optional)

## Custom Domain (Optional)

1. Go to Railway Dashboard → Your Service → Settings
2. Click "Custom Domain"
3. Add your domain
4. Update DNS records as instructed

## Scaling (Paid Plans)

Railway scales automatically, but you can configure:

```bash
# Set number of replicas
railway scale --replicas 2

# Set memory limit
railway scale --memory 2Gi

# Set CPU limit
railway scale --cpu 2
```

## Monitoring

View real-time logs:
```bash
railway logs --follow
```

View metrics:
```bash
railway metrics
```

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
railway connect
# Run psql
psql $DATABASE_URL
```

### Build Failures

Check build logs:
```bash
railway logs --build
```

### Memory Issues

Increase memory allocation:
```bash
railway scale --memory 2Gi
```

### Rollback

Rollback to previous deployment:
```bash
railway rollback
```

## Updating

To deploy updates:

```bash
git add .
git commit -m "Update app"
git push
railway up
```

Railway can also auto-deploy on git push (enable in dashboard).

## Cost

Railway pricing:
- **Free tier**: $5 credit/month (good for testing)
- **Hobby**: $5/month + usage
- **Pro**: $20/month + usage

Estimate for dumphim:
- Small app: $5-10/month
- With database: $10-20/month

## Support

- Railway Docs: docs.railway.app
- Railway Discord: discord.gg/railway
- Railway Support: railway.app/support