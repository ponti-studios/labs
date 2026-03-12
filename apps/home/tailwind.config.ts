import type { Config } from "tailwindcss";

const config: Config = {
	plugins: [
		require("@tailwindcss/forms"),
		require("tailwindcss-animate"),
	],
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ["Geist", "ui-sans-serif", "system-ui", "sans-serif"],
				serif: ["Geist", "ui-sans-serif", "system-ui", "sans-serif"],
				mono: ["Geist Mono", "ui-monospace", "monospace"],
			},
			width: {
				"part-full": "calc(100% - 1.5rem)",
			},
			fontSize: {
				"fluid-1": "clamp(24px, calc(24px + 2.03vw), 45px)",
				"fluid-2": "clamp(32px, calc(32px + 3.50vw), 75px)",
				"fluid-3": "clamp(42px, calc(42px + 4.79vw), 85px)",
			},
			margin: {
				"fluid-2": "clamp(32px, calc(32px + 4.79vw), 75px)",
			},
			lineHeight: {
				"fluid-1": "clamp(20px, calc(20px + 2.03vw), 50px)",
				"fluid-2": "clamp(32px, calc(32px + 3.50vw), 75px)",
				"fluid-3": "clamp(42px, calc(42px + 4.79vw), 85px)",
			},
			backgroundImage: {
				"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
				"gradient-conic":
					"conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
			},
			colors: {
				"bg-app": "#ebe6dc",
				"bg-panel-0": "#f6f0e4",
				"bg-panel-1": "#efe7d8",
				"bg-panel-2": "#e5dccb",
				"bg-elevated": "#fbf7ef",
				"text-primary": "#161514",
				"text-secondary": "#43403c",
				"text-muted": "#76706a",
				"text-ghost": "#aaa39a",
				"accent-active": "#1f1d1b",
				"border-subtle": "rgba(22,21,20,0.08)",
				"border-default": "rgba(22,21,20,0.14)",
				"border-strong": "rgba(22,21,20,0.22)",
				"border-accent": "rgba(22,21,20,0.30)",
				primary: {
					DEFAULT: "#1f1d1b",
					foreground: "#f6f0e4",
				},
				background: "#f6f0e4",
				foreground: "#161514",
				card: {
					DEFAULT: "#f6f0e4",
					foreground: "#161514",
				},
				popover: {
					DEFAULT: "#fbf7ef",
					foreground: "#161514",
				},
				secondary: {
					DEFAULT: "#efe7d8",
					foreground: "#161514",
				},
				muted: {
					DEFAULT: "#efe7d8",
					foreground: "#43403c",
				},
				accent: {
					DEFAULT: "#efe7d8",
					foreground: "#161514",
				},
				destructive: {
					DEFAULT: "#985252",
					foreground: "#f6f0e4",
				},
				border: "rgba(22,21,20,0.14)",
				input: "rgba(22,21,20,0.14)",
				ring: "#1f1d1b",
				chart: {
					"1": "#5d7f61",
					"2": "#9a7a46",
					"3": "#6f8091",
					"4": "#b05a4a",
					"5": "#6b876a",
				},
			},
			keyframes: {
				pulse: {
					"0%, 100%": {
						opacity: "0.99",
						filter:
							"drop-shadow(0 0 1px rgba(252, 211, 77)) drop-shadow(0 0 15px rgba(245, 158, 11)) drop-shadow(0 0 1px rgba(252, 211, 77))",
					},
					"50%": {
						opacity: "0.4",
						filter: "none",
					},
				},
				flicker: {
					"0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100%": {
						opacity: "0.99",
						filter:
							"drop-shadow(0 0 1px rgba(252, 211, 77)) drop-shadow(0 0 15px rgba(245, 158, 11)) drop-shadow(0 0 1px rgba(252, 211, 77))",
					},
					"20%, 21.999%, 63%, 63.999%, 65%, 69.999%": {
						opacity: "0.4",
						filter: "none",
					},
				},
				shimmer: {
					"0%": {
						backgroundPosition: "-700px 0",
					},
					"100%": {
						backgroundPosition: "700px 0",
					},
				},
			},
			animation: {
				pulse: "pulse 1.5s ease-in-out infinite",
				flicker: "flicker 3s linear infinite",
				shimmer: "shimmer 1.3s linear infinite",
			},
			borderRadius: {
				lg: "8px",
				md: "6px",
				sm: "4px",
			},
			spacing: {
				"1": "4px",
				"2": "8px",
				"3": "12px",
				"4": "16px",
				"5": "20px",
				"6": "24px",
				"8": "32px",
			},
		},
	},
};
export default config;
