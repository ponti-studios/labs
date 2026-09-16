import { z } from "zod";

export { LabsServerEnv } from "@pontistudios/env";
export type { LabsServerEnv as LabsServerEnvType } from "@pontistudios/env";

export const HominemAuthEnv = z.object({
  HOMINEM_API_URL: z.string().url().optional(),
  HOMINEM_INTERNAL_API_URL: z.string().url().optional(),
  NODE_ENV: z.string().optional(),
});

export type HominemAuthEnv = z.infer<typeof HominemAuthEnv>;
