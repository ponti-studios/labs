/**
 * Canonical semantic color contract for the Ponti Studios system.
 *
 * Components consume these roles. The runtime CSS provides the light and dark
 * values; this module exists for inspection, tooling, and typed consumers.
 */

export const colorTokenNames = [
  "surface-canvas",
  "surface-panel",
  "surface-raised",
  "surface-inset",
  "surface-hover",
  "surface-pressed",
  "surface-selected",
  "surface-disabled",
  "overlay-scrim",
  "text-primary",
  "text-secondary",
  "text-tertiary",
  "text-disabled",
  "text-accent",
  "text-destructive",
  "text-success",
  "text-warning",
  "text-on-accent",
  "text-on-destructive",
  "text-on-success",
  "text-on-warning",
  "border-subtle",
  "border-default",
  "border-strong",
  "border-focus",
  "border-accent",
  "border-destructive",
  "accent",
  "accent-hover",
  "accent-pressed",
  "accent-subtle",
  "destructive",
  "destructive-hover",
  "destructive-pressed",
  "destructive-subtle",
  "success",
  "success-subtle",
  "warning",
  "warning-subtle",
  "ring-focus",
] as const;

export type ColorToken = (typeof colorTokenNames)[number];
export type ColorMode = "light" | "dark";
export type ColorSystem = "ponti";
export type ColorTheme = Record<ColorToken, string>;
export type ColorSystemThemes = Record<ColorMode, ColorTheme>;

const pontiLight: ColorTheme = {
  "surface-canvas": "#ffffff",
  "surface-panel": "#f6f8fa",
  "surface-raised": "#ffffff",
  "surface-inset": "#eff2f5",
  "surface-hover": "#e8ebef",
  "surface-pressed": "#dfe3e8",
  "surface-selected": "rgba(9, 105, 218, 0.1)",
  "surface-disabled": "#eff2f5",
  "overlay-scrim": "rgba(31, 35, 40, 0.42)",
  "text-primary": "#25292e",
  "text-secondary": "#59636e",
  "text-tertiary": "#818b98",
  "text-disabled": "#9ea7b3",
  "text-accent": "#0969da",
  "text-destructive": "#cf222e",
  "text-success": "#1f883d",
  "text-warning": "#9a6700",
  "text-on-accent": "#ffffff",
  "text-on-destructive": "#ffffff",
  "text-on-success": "#ffffff",
  "text-on-warning": "#1c1c1e",
  "border-subtle": "rgba(129, 139, 152, 0.2)",
  "border-default": "#d1d9e0",
  "border-strong": "#8c959f",
  "border-focus": "#0969da",
  "border-accent": "#0969da",
  "border-destructive": "#cf222e",
  accent: "#0969da",
  "accent-hover": "#0550ae",
  "accent-pressed": "#033d8b",
  "accent-subtle": "rgba(9, 105, 218, 0.1)",
  destructive: "#cf222e",
  "destructive-hover": "#a40e26",
  "destructive-pressed": "#82071e",
  "destructive-subtle": "rgba(207, 34, 46, 0.12)",
  success: "#1f883d",
  "success-subtle": "rgba(31, 136, 61, 0.12)",
  warning: "#9a6700",
  "warning-subtle": "rgba(154, 103, 0, 0.12)",
  "ring-focus": "#0969da",
};

const pontiDark: ColorTheme = {
  "surface-canvas": "#0d1117",
  "surface-panel": "#161b22",
  "surface-raised": "#21262d",
  "surface-inset": "#1a2029",
  "surface-hover": "#242a33",
  "surface-pressed": "#30363d",
  "surface-selected": "rgba(47, 129, 247, 0.18)",
  "surface-disabled": "#1a2029",
  "overlay-scrim": "rgba(1, 4, 9, 0.78)",
  "text-primary": "#f0f6fc",
  "text-secondary": "#8b949e",
  "text-tertiary": "#6e7681",
  "text-disabled": "#484f58",
  "text-accent": "#58a6ff",
  "text-destructive": "#ff7b72",
  "text-success": "#3fb950",
  "text-warning": "#d29922",
  "text-on-accent": "#ffffff",
  "text-on-destructive": "#ffffff",
  "text-on-success": "#ffffff",
  "text-on-warning": "#0d1117",
  "border-subtle": "rgba(240, 246, 252, 0.14)",
  "border-default": "#30363d",
  "border-strong": "#6e7681",
  "border-focus": "#2f81f7",
  "border-accent": "#2f81f7",
  "border-destructive": "#da3633",
  accent: "#2f81f7",
  "accent-hover": "#58a6ff",
  "accent-pressed": "#1f6feb",
  "accent-subtle": "rgba(47, 129, 247, 0.18)",
  destructive: "#da3633",
  "destructive-hover": "#f85149",
  "destructive-pressed": "#b62324",
  "destructive-subtle": "rgba(218, 54, 51, 0.18)",
  success: "#238636",
  "success-subtle": "rgba(35, 134, 54, 0.18)",
  warning: "#9e6a03",
  "warning-subtle": "rgba(158, 106, 3, 0.18)",
  "ring-focus": "#2f81f7",
};

export const colorSystems = {
  ponti: { light: pontiLight, dark: pontiDark },
} as const satisfies Record<ColorSystem, ColorSystemThemes>;

export const colors = colorTokenNames.reduce(
  (accumulator, token) => {
    accumulator[token] = `var(--color-${token})`;
    return accumulator;
  },
  {} as Record<ColorToken, `var(--color-${string})`>,
);

export const COLOR_SYSTEM_ATTRIBUTE = "data-color-system" as const;
export const COLOR_MODE_ATTRIBUTE = "data-color-mode" as const;
