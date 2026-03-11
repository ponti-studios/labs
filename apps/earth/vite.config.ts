import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    {
      name: "cesium-middleware",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Ensure Cesium files are served with correct MIME type
          if (req.url?.startsWith("/cesium/")) {
            if (req.url.endsWith(".js")) {
              res.setHeader("Content-Type", "application/javascript");
            }
          }
          next();
        });
      },
    },
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
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
});
