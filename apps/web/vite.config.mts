import { writeFileSync } from "node:fs";
import * as path from "node:path";
import react from "@vitejs/plugin-react";
import analyze from "rollup-plugin-analyzer";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tsconfigPaths(),
		VitePWA({
			manifest: {
				name: "Rocco",
				short_name: "rocco",
				start_url: "/",
				display: "standalone",
				theme_color: "#ffffff",
				background_color: "#ffffff",
				icons: [
					{
						src: "/favicon.ico",
						sizes: "64x64 32x32 24x24 16x16",
						type: "image/x-icon",
					},
				],
			},
			registerType: "autoUpdate",
		}),
	],
	build: {
		minify: "esbuild",
		outDir: "build",
		rollupOptions: {
			plugins: [
				analyze({
					summaryOnly: true,
					writeTo(analysisString) {
						if (process.env.ANALYZE === "true") {
							writeFileSync("build-analysis.txt", analysisString);
						}
					},
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
		watch: {
			ignored: [
				"**/node_modules",
				"**/.git",
				"**/.yarn",
				"**/.pnp.*",
				"**/*.test.tsx",
			],
		},
	},
});
