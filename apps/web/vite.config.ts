import react from "@vitejs/plugin-react";
import * as path from "path";
import analyze from "rollup-plugin-analyzer";
import { defineConfig, splitVendorChunkPlugin } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), splitVendorChunkPlugin()],
  build: {
    outDir: "build",
    rollupOptions: {
      plugins: [
        analyze({
          summaryOnly: true,
        }),
      ],
    },
  },
  preview: {
    port: 53422,
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 53422,
  },
});
