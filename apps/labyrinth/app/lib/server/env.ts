import { z } from "zod";

export const LabyrinthServerEnv = z
  .object({
    OPENROUTER_API_KEY: z.string(),
    OPENROUTER_MODEL: z.string().optional(),
  })
  .transform((env) => ({
    openRouterApiKey: env.OPENROUTER_API_KEY,
    openRouterModel: env.OPENROUTER_MODEL ?? "openai/gpt-5.1",
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
