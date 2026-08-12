import { reactRouter } from "@react-router/dev/vite";
import { sentryReactRouter } from "@sentry/react-router";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { defineConfig } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";

export default defineConfig((config) => ({
  envDir: false,
  plugins: [
    devtoolsJson(),
    tailwindcss(),
    reactRouter(),
    ...(process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT
      ? [
          sentryReactRouter(
            {
              authToken: process.env.SENTRY_AUTH_TOKEN,
              org: process.env.SENTRY_ORG,
              project: process.env.SENTRY_PROJECT,
              sourcemaps: { filesToDeleteAfterUpload: ["./build/**/*.map"] },
            },
            config,
          ),
        ]
      : []),
  ],
  build: {
    cssMinify: "esbuild",
    chunkSizeWarningLimit: 1500,
  },
  resolve: {
    tsconfigPaths: true,
    alias: {
      "~": path.resolve(import.meta.dirname, "./app"),
    },
  },
  server: {
    port: 3001,
    strictPort: true,
  },
}));
