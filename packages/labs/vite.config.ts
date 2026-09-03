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
    alias: {
      "~": path.resolve(import.meta.dirname, "./app"),
    },
  },
  server: {
    port: 3001,
    strictPort: true,
    // Vite's dev middleware answers OPTIONS preflights itself before they
    // ever reach the app's route handlers — its boolean default reflects
    // Origin but omits Access-Control-Allow-Credentials, which the `what`
    // app's credentialed cross-origin fetches need. This mirrors the same
    // allowlist as the What portless origin for local dev; production
    // (react-router-serve, no Vite dev middleware) always uses that route
    // handler logic directly.
    cors: {
      origin: ["https://what.lvh.me:4200"],
      credentials: true,
    },
  },
}));
