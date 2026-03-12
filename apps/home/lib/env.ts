import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { z } from "zod";

const envSchema = z.object({
	DATABASE_URL: z.string().url(),
	NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),
	NEXT_PUBLIC_SHOW_LOGGER: z.string().optional(),
});

let _env: z.infer<typeof envSchema> | null = null;

// Lazy getter that validates environment only when accessed
export const env = new Proxy({} as z.infer<typeof envSchema>, {
	get(target, prop) {
		if (!_env) {
			_env = envSchema.parse(process.env);
		}
		return _env[prop as keyof typeof _env];
	},
});
