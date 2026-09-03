import { z } from "zod";

export * from "@pontistudios/env";

export const WhatServerEnv = z.object({
  WHAT_APP_URL: z.string().url(),
  PORTLESS_URL: z.string().url().optional(),
});

export type WhatServerEnv = z.infer<typeof WhatServerEnv>;
