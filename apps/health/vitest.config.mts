import { defineConfig } from "vitest/config";

const BASE_EXCLUDE = [".next", "node_modules", "coverage", "dist", "e2e/**/*.spec.ts"];

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    environment: "jsdom",
    clearMocks: true,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    exclude: BASE_EXCLUDE,
    coverage: {
      provider: "v8",
      clean: true,
      enabled: true,
      exclude: [...BASE_EXCLUDE, "src/**/*.spec.{ts,tsx}", "src/**/*.test.{ts,tsx}"],
      reporter: ["lcov"],
      reportsDirectory: "coverage",
    },
  },
});
