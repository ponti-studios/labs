import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  build: {
    cssMinify: "esbuild",
  },
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 3005,
  },
});
