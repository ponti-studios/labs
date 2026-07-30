import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { defineConfig } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";

export default defineConfig({
  envDir: false,
  plugins: [devtoolsJson(), tailwindcss(), reactRouter()],
  build: {
    cssMinify: "esbuild",
    chunkSizeWarningLimit: 1500,
  },
  resolve: {
    tsconfigPaths: true,
    alias: {
      "~": path.resolve(__dirname, "./app"),
    },
  },
  server: {
    port: 3001,
    strictPort: true,
  },
});
