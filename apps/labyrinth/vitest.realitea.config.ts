import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    clearMocks: true,
    include: ["app/lib/realitea/__tests__/*.test.ts"],
    fileParallelism: false,
    coverage: { enabled: true, provider: "v8", reporter: "lcov", reportsDirectory: "./coverage" },
  },
});
