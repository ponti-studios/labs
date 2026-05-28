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

export const RhobhSchedulerEnv = z
  .object({
    RHOBH_DAILY_PUZZLE_TOKEN: z.string().min(1),
  })
  .transform((env) => ({
    rhobhDailyPuzzleToken: env.RHOBH_DAILY_PUZZLE_TOKEN,
  }));

export type RhobhSchedulerEnv = z.infer<typeof RhobhSchedulerEnv>;
