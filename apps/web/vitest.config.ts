import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react(), tsconfigPaths()],
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: "./src/test/test.setup.tsx",
		clearMocks: true,
		coverage: {
			provider: "v8",
			clean: true,
			enabled: true,
			exclude: [
				"build/**",
				"src/services/constants",
				"src/styles",
				"src/testUtils",
				"src/main.tsx",
				"src/**/*.spec.{ts,tsx}",
				"src/**/*.test.{ts,tsx}",
				"test/**",
				"*.config.{js,cjs}",
			],
			reporter: ["lcov"],
			reportsDirectory: "coverage",
		},
	},
});
