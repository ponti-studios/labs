import { defineConfig } from "drizzle-kit";
import "dotenv/config";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
	throw new Error("DATABASE_URL is not set");
}

export default defineConfig({
	schema: "./app/db/schema.ts",
	out: "./app/db",
	dialect: "postgresql",
	dbCredentials: {
		url: DATABASE_URL,
	},
});
