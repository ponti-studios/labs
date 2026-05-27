import { config as loadEnvFile } from "dotenv";
import path from "node:path";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

loadEnvFile({
	path: path.resolve(import.meta.dirname, "../../.env"),
	override: true,
});

export default defineConfig({
	plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
	server: {
		port: 3001,
		strictPort: true,
	},
});
