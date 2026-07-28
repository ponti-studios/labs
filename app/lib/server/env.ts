import "dotenv/config";
import { z } from "zod";

export const LabyrinthServerEnv = z
  .object({
    OPENROUTER_API_KEY: z.string(),
    PUBLIC_DATA_URL: z.string().default("https://public-data-production.up.railway.app"),
    R2_ENDPOINT: z.string().default("http://localhost:9000"),
    R2_BUCKET_NAME: z.string().default("labyrinth"),
    R2_ACCESS_KEY_ID: z.string().default("minioadmin"),
    R2_SECRET_ACCESS_KEY: z.string().default("minioadmin"),
    R2_PUBLIC_URL: z.string().default("http://localhost:9000"),
  })
  .transform((env) => ({
    openRouterApiKey: env.OPENROUTER_API_KEY,
    publicDataUrl: env.PUBLIC_DATA_URL,
    r2Endpoint: env.R2_ENDPOINT,
    r2Bucket: env.R2_BUCKET_NAME,
    r2AccessKeyId: env.R2_ACCESS_KEY_ID,
    r2SecretAccessKey: env.R2_SECRET_ACCESS_KEY,
    r2PublicUrl: env.R2_PUBLIC_URL,
  }));

export type LabyrinthServerEnv = z.infer<typeof LabyrinthServerEnv>;
