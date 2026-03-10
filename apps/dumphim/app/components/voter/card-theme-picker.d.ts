export interface CardTheme {
  value: string;
  label: string;
  border: string;
  bg: string;
}
export declare const COLOR_THEMES: CardTheme[];
interface CardThemePickerProps {
  colorTheme: string;
  setColorTheme: (theme: string) => void;
}
export declare function CardThemePicker({
  colorTheme,
  setColorTheme,
}: CardThemePickerProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=card-theme-picker.d.ts.map
