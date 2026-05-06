import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [tsconfigPaths() as any],
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: ["vitest.setup.ts"],
		include: ["**/*.test.{ts,tsx,js,jsx}"],

		clearMocks: true,
		coverage: {
			provider: "v8",
			clean: true,
			enabled: true,
			exclude: ["src/**/*.spec.{ts,tsx}", "src/**/*.test.{ts,tsx}"],
			reporter: ["lcov"],
			reportsDirectory: "coverage",
		},
	},
});
