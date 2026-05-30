import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { config as loadEnvFile } from "dotenv";
import path from "node:path";
import { defineConfig } from "vite";

loadEnvFile({
  path: path.resolve(import.meta.dirname, "../../.env"),
  override: true,
});

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  build: {
    cssMinify: "esbuild",
  },
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 3001,
    strictPort: true,
  },
});
