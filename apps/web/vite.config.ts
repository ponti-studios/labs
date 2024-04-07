import * as path from "node:path";
import react from "@vitejs/plugin-react";
import analyze from "rollup-plugin-analyzer";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	build: {
		outDir: "build",
		rollupOptions: {
			output: {
				manualChunks(id) {
					const doNotInclude: string[] = ["spotlight"];

					if (id.includes("node_modules")) {
						if (doNotInclude.find((moduleName) => id.includes(moduleName)))
							return;
						return "vendor";
					}
				},
			},
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
