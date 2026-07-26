import { useColorScheme } from "react-native";

import { colorThemes, type ColorMode, type ColorTheme } from "../tokens";

/**
 * Resolves the active color mode from the OS appearance setting.
 *
 * React Native's `useColorScheme` reports `null` before the appearance module
 * has settled, so anything that isn't explicitly "dark" resolves to light —
 * callers always receive a concrete mode rather than having to handle null.
 */
export function useColorMode(): ColorMode {
  return useColorScheme() === "dark" ? "dark" : "light";
}

/** The full color token set for the active OS appearance. */
export function useThemeColors(): ColorTheme {
  return colorThemes[useColorMode()];
}
