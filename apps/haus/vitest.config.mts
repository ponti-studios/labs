import react from "@vitejs/plugin-react";
import path from "node:path";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react(), tsconfigPaths()],
	test: {
		globals: true,
		setupFiles: ["./tests/test.setup.ts"],
		environment: "jsdom",
		coverage: {
			provider: "v8",
		},
	},
	resolve: {
		alias: {
			src: path.resolve(__dirname, "src"),
			"~": path.resolve(__dirname, "public"),
		},
	},
});
