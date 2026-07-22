import "../src/styles.css";
import { withThemeByClassName } from "@storybook/addon-themes";
import type { Decorator, Preview } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { commonControlsExclude } from "../src/storybook/controls";
import { colorThemes, type ColorMode } from "../src/tokens";

const colorModeDecorator: Decorator = (Story, context) => {
  const mode = (context.globals.theme ?? "light") as ColorMode;
  const theme = colorThemes[mode];
  const style = Object.fromEntries(
    Object.entries(theme).map(([token, value]) => [`--color-${token}`, value]),
  ) as CSSProperties;

  Object.assign(style, {
    "--ponti-primary": theme.accent,
    "--ponti-primary-foreground": theme["text-on-accent"],
    "--ponti-destructive": theme.destructive,
    "--ponti-destructive-foreground": theme["text-on-destructive"],
    "--ponti-foreground": theme["text-primary"],
    "--ponti-muted-foreground": theme["text-secondary"],
    "--ponti-border": theme["border-default"],
    "--ponti-ring": theme["ring-focus"],
    "--color-background": theme["surface-canvas"],
    "--color-foreground": theme["text-primary"],
    "--color-card": theme["surface-panel"],
    "--color-card-foreground": theme["text-primary"],
    "--color-popover": theme["surface-raised"],
    "--color-popover-foreground": theme["text-primary"],
    "--color-primary": theme.accent,
    "--color-primary-foreground": theme["text-on-accent"],
    "--color-secondary": theme["surface-panel"],
    "--color-secondary-foreground": theme["text-primary"],
    "--color-muted": theme["surface-inset"],
    "--color-muted-foreground": theme["text-secondary"],
    "--color-accent-foreground": theme["text-primary"],
    "--color-destructive-foreground": theme["text-on-destructive"],
    "--color-border": theme["border-default"],
    "--color-input": theme["border-default"],
    "--color-ring": theme["ring-focus"],
    "--color-chart-1": theme["chart-1"],
    "--color-chart-2": theme["chart-2"],
    "--color-chart-3": theme["chart-3"],
    "--color-chart-4": theme["chart-4"],
    "--color-chart-5": theme["chart-5"],
  });

  return (
    <div className="min-h-screen bg-background text-foreground" style={style}>
      <Story />
    </div>
  );
};

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
  decorators: [storybookThemeDecorator, colorModeDecorator],
  parameters: {
    layout: "centered",
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
