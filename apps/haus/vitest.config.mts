import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		setupFiles: ["./tests/test.setup.ts"],
		environment: "jsdom",
		coverage: {
			provider: "v8",
		},
	},
	resolve: {
		tsconfigPaths: true,
		alias: {
			src: path.resolve(__dirname, "src"),
			"~": path.resolve(__dirname, "public"),
		},
	},
});
