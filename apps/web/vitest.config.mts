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
        "src/services/constants",
        "src/styles",
        "src/testUtils",
        "src/**/*.spec.{ts,tsx}",
      ],
      reporter: ["lcov"],
      reportsDirectory: "coverage",
    },
  },
});
