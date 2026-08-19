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
      // @ponti-studios/auth@0.1.1 ships an `exports` map pointing at its
      // unpublished `src/*.ts` sources instead of `build/*` (its
      // publishConfig.exports override was not applied at publish time).
      // Alias the one subpath we use until a fixed version is published.
      "@ponti-studios/auth/server": path.resolve(
        import.meta.dirname,
        "./node_modules/@ponti-studios/auth/build/server.js",
      ),
    },
  },
  server: {
    port: 3001,
    strictPort: true,
  },
}));
