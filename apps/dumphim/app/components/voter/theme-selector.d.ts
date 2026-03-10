import type React from "react";
import type { PokemonTheme } from "~/lib/pokemon-theme-context";
interface ThemeSelectorProps {
  currentTheme: PokemonTheme;
  onThemeChange: (theme: PokemonTheme) => void;
}
declare const ThemeSelector: React.FC<ThemeSelectorProps>;
export default ThemeSelector;
//# sourceMappingURL=theme-selector.d.ts.map
