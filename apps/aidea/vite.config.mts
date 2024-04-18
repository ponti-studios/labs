import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	test: {
		environment: "jsdom",
		setupFiles: ["./vitest.setup.mts"],
		clearMocks: true,
		coverage: {
			clean: true,
			enabled: true,
			exclude: [
				"src/services/constants",
				"src/styles",
				"src/testUtils",
				"src/**/*.spec.{ts,tsx}",
			],
			reporter: ["lcov"],
			reportsDirectory: "coverage",
		},
	},
	resolve: {
		alias: {
			src: path.resolve(__dirname, "src"),
			"~": path.resolve(__dirname, "public"),
		},
	},
});
