import "dotenv/config";
import { z } from "zod";

// Keep in sync with the Newsboy admin generate form bounds in ponti-studios/newsboy.
const MIN_GAME_MAX_TOKENS = 200;
const MAX_GAME_MAX_TOKENS = 16_000;

export const PontiServerEnv = z
  .object({
    OPENROUTER_API_KEY: z.string(),
    NEWSBOY_AI_MODEL: z.string().trim().min(1).optional(),
    GAME_REASONING_EFFORT: z
      .enum(["default", "none", "minimal", "low", "medium", "high"])
      .optional(),
    // Decimal digits only: the consumer reads this with Number.parseInt, which
    // would misread forms like "2e2" that z.coerce.number() accepts.
    GAME_MAX_TOKENS: z
      .string()
      .regex(/^\d+$/, "GAME_MAX_TOKENS must be a decimal integer")
      .transform(Number)
      .pipe(z.number().int().min(MIN_GAME_MAX_TOKENS).max(MAX_GAME_MAX_TOKENS))
      .optional(),
    PUBLIC_DATA_URL: z.string().default("https://public-data-production.up.railway.app"),
    R2_ENDPOINT: z.string().default("http://localhost:9000"),
    R2_BUCKET_NAME: z.string().default("labyrinth"),
    R2_ACCESS_KEY_ID: z.string().default("minioadmin"),
    R2_SECRET_ACCESS_KEY: z.string().default("minioadmin"),
    R2_PUBLIC_URL: z.string().default("http://localhost:9000"),
  })
  .transform((env) => ({
    openRouterApiKey: env.OPENROUTER_API_KEY,
    newsboyAiModel: env.NEWSBOY_AI_MODEL,
    gameReasoningEffort: env.GAME_REASONING_EFFORT,
    gameMaxTokens: env.GAME_MAX_TOKENS,
    publicDataUrl: env.PUBLIC_DATA_URL,
    r2Endpoint: env.R2_ENDPOINT,
    r2Bucket: env.R2_BUCKET_NAME,
    r2AccessKeyId: env.R2_ACCESS_KEY_ID,
    r2SecretAccessKey: env.R2_SECRET_ACCESS_KEY,
    r2PublicUrl: env.R2_PUBLIC_URL,
  }));

export type PontiServerEnv = z.infer<typeof PontiServerEnv>;
export const LabsServerEnv = PontiServerEnv;
export type LabsServerEnv = PontiServerEnv;

export const DatabaseEnv = z.object({
  DATABASE_URL: z.string().min(1),
});

export type DatabaseEnv = z.infer<typeof DatabaseEnv>;
