import type React from "react";
export type PokemonTheme = "yellow" | "blue" | "red" | "green" | "purple";
interface PokemonThemeContextType {
  currentTheme: PokemonTheme;
  setTheme: (theme: PokemonTheme) => void;
}
export declare const usePokemonTheme: () => PokemonThemeContextType;
export declare const PokemonThemeProvider: React.FC<{
  children: React.ReactNode;
}>;
export default PokemonThemeProvider;
//# sourceMappingURL=pokemon-theme-context.d.ts.map
