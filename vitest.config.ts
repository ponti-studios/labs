import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      // See vite.config.ts for why this alias exists.
      "@ponti-studios/auth/server": path.resolve(
        import.meta.dirname,
        "./node_modules/@ponti-studios/auth/build/server.js",
      ),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx,js,jsx}"],
    exclude: ["**/node_modules/**", "app/lib/what/__tests__/**"],

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
