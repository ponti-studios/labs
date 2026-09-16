import { z } from "zod";

export { LabsServerEnv } from "@pontistudios/env";
export type { LabsServerEnv as LabsServerEnvType } from "@pontistudios/env";

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
