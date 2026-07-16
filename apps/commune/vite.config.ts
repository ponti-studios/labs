import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import devtoolsJson from "vite-plugin-devtools-json";
import { defineConfig } from "vite";

export default defineConfig({
  envDir: false,
  plugins: [devtoolsJson(), tailwindcss(), reactRouter()],
  build: {
    cssMinify: "esbuild",
  },
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 3005,
    strictPort: true,
  },
});
