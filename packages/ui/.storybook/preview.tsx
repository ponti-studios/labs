import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview } from "@storybook/react-vite";
import { commonControlsExclude } from "../src/storybook/controls";
import "../src/styles/index.css";
import "./generated/dark-theme-class.css";

// The shipped stylesheet only switches theme via `prefers-color-scheme`
// (real apps have no manual toggle). `dark-theme-class.css` is a
// Storybook-only build of the same dark tokens keyed off the
// `storybook-theme-dark` class instead, so the addon-themes toolbar below
// can preview dark mode without depending on the OS setting. It's generated
// by `style-dictionary.dark-storybook.json` (see the `storybook`/`tokens:build`
// scripts) — never hand-edit it.
const storybookThemeDecorator = withThemeByClassName({
  themes: { light: "storybook-theme-light", dark: "storybook-theme-dark" },
  defaultTheme: "light",
});

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Preview color mode",
      toolbar: {
        icon: "circlehollow",
        items: ["light", "dark"],
        title: "Color mode",
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  decorators: [storybookThemeDecorator],
  parameters: {
    layout: "centered",
    a11y: { test: "error" },
    controls: {
      exclude: commonControlsExclude,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      sort: "requiredFirst",
      expanded: true,
    },
    options: {
      storySort: {
        order: [
          "Audit",
          "Tokens",
          "Primitives",
          "Forms",
          "Feedback",
          "Navigation",
          "Patterns",
          "Surfaces",
          "Layouts",
          "Motion",
          "Internal",
        ],
      },
    },
  },
};

export default preview;
