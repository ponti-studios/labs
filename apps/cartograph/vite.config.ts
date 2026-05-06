import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [reactRouter(), tsconfigPaths()],
  server: {
    port: 3006,
    fs: {
      strict: false,
    },
  },
  build: {
    sourcemap: true,
  },
  define: {
    CESIUM_BASE_URL: JSON.stringify("/cesium/"),
  },
  optimizeDeps: {
    include: ["cesium"],
  },
});
