import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    cssMinify: "esbuild",
  },
  server: {
    port: 3006,
    fs: {
      strict: false,
    },
  },
});
