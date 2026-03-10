import { z } from 'zod';

// Environment schema and normalization for the database configuration.
// Key names mirror conventional env vars used across the monorepo.

export const DbEnv = z
  .object({
    DATABASE_URL: z.string(),
    DB_CONNECTION_LIMIT: z.string().optional(),
    DB_QUEUE_LIMIT: z.string().optional(),
    DB_ENABLE_KEEP_ALIVE: z.string().optional(),
  })
  .transform((env) => ({
    url: env.DATABASE_URL,
    connectionLimit: env.DB_CONNECTION_LIMIT
      ? Number(env.DB_CONNECTION_LIMIT)
      : undefined,
    queueLimit: env.DB_QUEUE_LIMIT ? Number(env.DB_QUEUE_LIMIT) : undefined,
    enableKeepAlive:
      env.DB_ENABLE_KEEP_ALIVE === undefined
        ? undefined
        : env.DB_ENABLE_KEEP_ALIVE === 'true',
  }));

export type DbEnv = z.infer<typeof DbEnv>;
