import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../app/**/*.stories.@(js|jsx|mjs|ts|tsx)"],

  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-docs"),
    getAbsolutePath("@storybook/addon-a11y"),
  ],

  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {
      builder: {
        viteConfigPath: fileURLToPath(new URL("sb-vite.config.ts", import.meta.url)),
      },
    },
  },

  viteFinal: async (config) => {
    const { mergeConfig } = await import("vite");
    const tailwindcss = (await import("@tailwindcss/vite")).default;
    return mergeConfig(config, {
      root: fileURLToPath(new URL("..", import.meta.url)),
      plugins: [tailwindcss()],
      resolve: {
        alias: {
          "~": fileURLToPath(new URL("../app", import.meta.url)),
        },
      },
      build: { target: "esnext" },
    });
  },
};
export default config;

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
