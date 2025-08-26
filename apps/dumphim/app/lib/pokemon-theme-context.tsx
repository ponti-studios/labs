import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

export type PokemonTheme = "yellow" | "blue" | "red" | "green" | "purple";

interface PokemonThemeContextType {
	currentTheme: PokemonTheme;
	setTheme: (theme: PokemonTheme) => void;
}

const PokemonThemeContext = createContext<PokemonThemeContextType>({
	currentTheme: "yellow", // Default theme
	setTheme: () => {},
});

export const usePokemonTheme = () => useContext(PokemonThemeContext);

export const PokemonThemeProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	// Try to get the theme from localStorage, default to "yellow"
	const [currentTheme, setCurrentTheme] = useState<PokemonTheme>(() => {
		const savedTheme =
			typeof window !== "undefined"
				? (localStorage.getItem("pokemon-theme") as PokemonTheme | null)
				: null;

		return savedTheme || "yellow";
	});

	// Update localStorage when theme changes
	useEffect(() => {
		if (typeof window !== "undefined") {
			localStorage.setItem("pokemon-theme", currentTheme);
		}
	}, [currentTheme]);

	const setTheme = (theme: PokemonTheme) => {
		setCurrentTheme(theme);
	};

	return (
		<PokemonThemeContext.Provider value={{ currentTheme, setTheme }}>
			{children}
		</PokemonThemeContext.Provider>
	);
};

export default PokemonThemeProvider;
