import { Label, RadioGroup, RadioGroupItem } from "@pontistudios/ui";
import { cn } from "~/lib/utils";

export interface CardTheme {
  value: string;
  label: string;
  border: string;
  color: string;
}

export const COLOR_THEMES: CardTheme[] = [
  { value: "classic", label: "Classic", border: "border-yellow-500", color: "#EAB308" },
  { value: "galaxy",  label: "Galaxy",  border: "border-purple-500", color: "#A855F7" },
  { value: "fire",    label: "Fire",    border: "border-orange-500", color: "#F97316" },
  { value: "water",   label: "Water",   border: "border-blue-500",   color: "#3B82F6" },
  { value: "forest",  label: "Forest",  border: "border-green-500",  color: "#22C55E" },
];

interface CardThemePickerProps {
  colorTheme: string;
  setColorTheme: (theme: string) => void;
}

export function CardThemePicker({ colorTheme, setColorTheme }: CardThemePickerProps) {
  return (
    <div data-testid="theme-picker" className="space-y-2">
      <Label className="text-gray-700">Card Theme</Label>
      <RadioGroup
        value={colorTheme}
        onValueChange={setColorTheme}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"
      >
        {COLOR_THEMES.map((theme) => (
          <div key={theme.value} className="flex items-center space-x-2">
            <RadioGroupItem value={theme.value} id={`theme-${theme.value}`} className="sr-only" />
            <Label
              htmlFor={`theme-${theme.value}`}
              className={cn(
                "flex flex-col items-center justify-center w-full p-2 rounded-lg cursor-pointer border-2",
                colorTheme === theme.value ? "border-black" : "border-transparent",
                "hover:border-gray-300 transition-all",
              )}
            >
              <div className={cn("mb-1 h-8 w-full rounded", theme.bg)} />
              <span className="text-xs">{theme.label}</span>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
