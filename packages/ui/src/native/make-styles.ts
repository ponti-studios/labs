import type { ImageStyle, TextStyle, ViewStyle } from "react-native";

export type NamedStyles = Record<string, ViewStyle | TextStyle | ImageStyle>;

/**
 * Builds a `makeStyles` helper bound to a consuming app's own theme hook.
 *
 * The theme *shape* stays owned by the app — this package supplies only the
 * mechanism — so `Theme` is a type parameter rather than a type exported from
 * here. An app calls this once with its `useTheme` and uses the result
 * everywhere:
 *
 * ```ts
 * export const makeStyles = createMakeStyles(useTheme);
 *
 * const useStyles = makeStyles((theme) => ({
 *   card: { backgroundColor: theme.colors.card },
 * }));
 * ```
 *
 * The returned `useStyles` is a hook: it calls `useTheme` on every render, so
 * styles re-resolve when the color mode changes. Styles are returned as plain
 * objects rather than passed through `StyleSheet.create`, since they are
 * rebuilt per render and React Native accepts plain style objects directly.
 */
export function createMakeStyles<Theme>(useTheme: () => Theme) {
  return function makeStyles<T extends NamedStyles>(factory: (theme: Theme) => T & NamedStyles) {
    return function useStyles(): T {
      return factory(useTheme());
    };
  };
}
