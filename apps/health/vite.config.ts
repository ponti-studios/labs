import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  envDir: false,
  plugins: [tailwindcss(), reactRouter()],
  build: {
    cssMinify: "esbuild",
  },
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 3003,
    strictPort: true,
  },
});
