import { z } from "zod";

export const LabyrinthServerEnv = z
  .object({
    OPENROUTER_API_KEY: z.string(),
    OPENROUTER_MODEL: z.string().optional(),
    S3_ENDPOINT: z.string().default("http://localhost:9000"),
    S3_REGION: z.string().default("auto"),
    S3_BUCKET: z.string().default("labyrinth"),
    S3_ACCESS_KEY_ID: z.string().default("minioadmin"),
    S3_SECRET_ACCESS_KEY: z.string().default("minioadmin"),
    S3_PUBLIC_URL: z.string().default("http://localhost:9000"),
  })
  .transform((env) => ({
    openRouterApiKey: env.OPENROUTER_API_KEY,
    openRouterModel: env.OPENROUTER_MODEL ?? "openai/gpt-5.1",
    s3Endpoint: env.S3_ENDPOINT,
    s3Region: env.S3_REGION,
    s3Bucket: env.S3_BUCKET,
    s3AccessKeyId: env.S3_ACCESS_KEY_ID,
    s3SecretAccessKey: env.S3_SECRET_ACCESS_KEY,
    s3PublicUrl: env.S3_PUBLIC_URL,
  }));

export type LabyrinthServerEnv = z.infer<typeof LabyrinthServerEnv>;

export const DailyPuzzleSchedulerEnv = z
  .object({
    REALITEA_TOKEN: z.string().min(1),
  })
  .transform((env) => ({
    dailyPuzzleToken: env.REALITEA_TOKEN,
  }));

export type DailyPuzzleSchedulerEnv = z.infer<typeof DailyPuzzleSchedulerEnv>;
