import type React from "react";
import type { PokemonTheme } from "~/lib/pokemon-theme-context";

interface ThemeSelectorProps {
	currentTheme: PokemonTheme;
	onThemeChange: (theme: PokemonTheme) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
	currentTheme,
	onThemeChange,
}) => {
	const themeOptions = [
		{ id: "yellow", label: "Pikachu (Yellow)" },
		{ id: "blue", label: "Squirtle (Blue)" },
		{ id: "red", label: "Charmander (Red)" },
		{ id: "green", label: "Bulbasaur (Green)" },
		{ id: "purple", label: "Gengar (Purple)" },
	] as const;

	return (
		<div className="theme-selector">
			{themeOptions.map((option) => (
				<button
					key={option.id}
					className={`theme-option theme-option-${option.id} ${
						currentTheme === option.id ? "active" : ""
					}`}
					onClick={() => onThemeChange(option.id)}
					title={option.label}
					type="button"
					aria-label={`Set ${option.label} theme`}
				/>
			))}
		</div>
	);
};

export default ThemeSelector;
