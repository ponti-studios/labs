import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/** Lib-mode multi-entry build used only by `pnpm size` to track real,
 *  transitive gzip cost per primitive/module over time. Not the app build —
 *  see vite.config.ts for that. */
export default defineConfig({
  plugins: [react()],
  build: {
    manifest: "manifest.json",
    lib: {
      entry: {
        // primitives
        button: resolve(__dirname, "src/primitives/button.tsx"),
        card: resolve(__dirname, "src/primitives/card.tsx"),
        popover: resolve(__dirname, "src/primitives/popover.tsx"),
        select: resolve(__dirname, "src/primitives/select.tsx"),
        "empty-state": resolve(__dirname, "src/primitives/empty-state.tsx"),
        "status-badge": resolve(__dirname, "src/primitives/status-badge.tsx"),
        sheet: resolve(__dirname, "src/primitives/sheet.tsx"),
        "primitives-index": resolve(__dirname, "src/primitives/index.ts"),
        // game
        "game-board": resolve(__dirname, "src/game/game-board.tsx"),
        "game-index": resolve(__dirname, "src/game/index.ts"),
      },
      formats: ["es"],
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime", "react-router", "lucide-react"],
    },
  },
});
