import { z } from "zod";

export const DbEnv = z
  .object({
    DATABASE_URL: z.string(),
  })
  .transform((env) => ({
    url: env.DATABASE_URL,
  }));

export type DbEnv = z.infer<typeof DbEnv>;
