import { z } from "zod";

console.log(process.env.VITE_OPENAI_API_KEY);
const envSchema = z.object({
	VITE_OPENAI_API_KEY: z.string().min(1, "VITE_OPENAI_API_KEY is required"),
	VITE_GOOGLE_API_KEY: z.string().min(1, "VITE_GOOGLE_API_KEY is required"),
});

export const env = envSchema.parse(process.env);
