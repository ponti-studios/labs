import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  build: {
    cssMinify: "esbuild",
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
