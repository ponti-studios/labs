import "dotenv/config";
import { z } from "zod";

export const LabsServerEnv = z
  .object({
    OPENROUTER_API_KEY: z.string(),
    NEWSBOY_AI_MODEL: z.string().trim().min(1).optional(),
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
    publicDataUrl: env.PUBLIC_DATA_URL,
    r2Endpoint: env.R2_ENDPOINT,
    r2Bucket: env.R2_BUCKET_NAME,
    r2AccessKeyId: env.R2_ACCESS_KEY_ID,
    r2SecretAccessKey: env.R2_SECRET_ACCESS_KEY,
    r2PublicUrl: env.R2_PUBLIC_URL,
  }));

export type LabsServerEnvType = z.infer<typeof LabsServerEnv>;

const DEFAULT_HOMINEM_API_URL = "https://api.lvh.me";

/**
 * Resolves HOMINEM_API_URL/HOMINEM_INTERNAL_API_URL before validation: in
 * development, an unset value is defaulted to the local-only
 * https://api.lvh.me origin; everywhere else it's left as-is, so a missing
 * var fails validation instead of silently redirecting production users to
 * lvh.me. HOMINEM_INTERNAL_API_URL falls back to HOMINEM_API_URL when unset.
 */
function resolveHominemUrls(raw: unknown): Record<string, unknown> {
  const env = { ...(raw as Record<string, string | undefined>) };
  const isDevelopment = env.NODE_ENV === "development";

  if (isDevelopment && !env.HOMINEM_API_URL) {
    env.HOMINEM_API_URL = DEFAULT_HOMINEM_API_URL;
  }

  if (!env.HOMINEM_INTERNAL_API_URL) {
    env.HOMINEM_INTERNAL_API_URL = env.HOMINEM_API_URL;
  }

  return env;
}

export const HominemAuthEnv = z.preprocess(
  resolveHominemUrls,
  z.object({
    HOMINEM_API_URL: z
      .string(
        "HOMINEM_API_URL is not set. Refusing to fall back to the local-only " +
          `${DEFAULT_HOMINEM_API_URL} default outside development.`,
      )
      .url(),
    HOMINEM_INTERNAL_API_URL: z.string().url(),
    NODE_ENV: z.string().optional(),
  }),
);

export type HominemAuthEnv = z.infer<typeof HominemAuthEnv>;
