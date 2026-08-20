import { resolve } from "node:path";
import preact from "@preact/preset-vite";
import { defineConfig } from "vite";

/** Lib-mode multi-entry build used only by `pnpm size` to track real,
 *  transitive gzip cost per primitive/module over time. Not the app build —
 *  see vite.config.ts for that. */
export default defineConfig({
  plugins: [preact()],
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
      external: [
        "preact",
        "preact/compat",
        "preact/compat/client",
        "preact/hooks",
        "preact/jsx-runtime",
        "react/jsx-runtime",
        "lucide-react",
      ],
    },
  },
});
