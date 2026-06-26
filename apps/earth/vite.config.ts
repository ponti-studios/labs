import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  envDir: false,
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    cssMinify: "esbuild",
    chunkSizeWarningLimit: 2000,
  },
  server: {
    port: Number(process.env.PORT) || 3006,
    fs: {
      strict: false,
    },
  },
});
