# rocco

This monorepo holds the services for Rocco.

### Apps

- `api`: Fastify API server
- `aidea`: React web application to store ideas and URL bookmarks
- `web`: React web application to store places

## Packages

- `tsconfig`: TypeScript configurations
- `ui`: component library

### Utilities

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [Biome](https://biomejs.dev) for linting and formatting (replacing ESLint and Prettier)

## Setup

1. Set environment variables:
   - `cp apps/api/.env.example apps/api/.env`
   - `cp apps/web/.env.example apps/web/.env`
   - Set `COOKIE_SALT` with helper function
   - Set `COOKIE_SECRET` with helper function
   - Set `SEGMENT_KEY` with helper function
1. Install dependencies: `npm install`
1. Build all apps and packages: `npm run build`
1. Start postgres and redis: `docker-compose up -d`
1. Migrate the database: `npm run prisma:migrate`
1. Start dev services: `npm run dev`

## Resources

Learn more about the power of Turborepo:

- **Turbo**
  - [Pipelines](https://turborepo.org/docs/features/pipelines)
  - [Caching](https://turborepo.org/docs/features/caching)
  - [Remote Caching (Beta)](https://turborepo.org/docs/features/remote-caching)
  - [Scoped Tasks](https://turborepo.org/docs/features/scopes)
  - [Configuration Options](https://turborepo.org/docs/reference/configuration)
  - [CLI Usage](https://turborepo.org/docs/reference/command-line-reference)
