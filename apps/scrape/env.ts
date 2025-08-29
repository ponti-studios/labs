import { z } from "zod/v3";

const envSchema = z.object({
	OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
});

export const env = envSchema.parse(process.env);
