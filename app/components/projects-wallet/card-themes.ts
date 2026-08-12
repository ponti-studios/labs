export type CardThemeName =
  | "obsidian"
  | "realitea"
  | "platinum"
  | "roseGold"
  | "cobalt"
  | "emerald"
  | "sunset"
  | "slate"
  | "frost"
  | "midnight";

export type CardTheme = {
  /** Card face — solid color or gradient. */
  background: string;
  /** Primary text color on the card face. */
  foreground: string;
  /** Badge, glow, and CTA color. */
  accent: string;
};

// Ten swappable "card stock" skins. `realitea` reuses RealiTea's own brand
// tokens (see app/routes/games/realitea/realitea.css); the rest are
// original premium-card palettes for future featured projects.
export const CARD_THEMES: Record<CardThemeName, CardTheme> = {
  obsidian: {
    background: "linear-gradient(135deg, #1a1a1d 0%, #000000 100%)",
    foreground: "#f5f5f5",
    accent: "#7dd3fc",
  },
  realitea: {
    background: "var(--realitea-ink)",
    foreground: "var(--realitea-paper)",
    accent: "var(--realitea-correct-bg)",
  },
  platinum: {
    background: "linear-gradient(135deg, #d8dbe0 0%, #9aa1ac 100%)",
    foreground: "#1c1f24",
    accent: "#0f766e",
  },
  roseGold: {
    background: "linear-gradient(135deg, #f4c9c0 0%, #d9a066 100%)",
    foreground: "#3b2417",
    accent: "#9d174d",
  },
  cobalt: {
    background: "linear-gradient(135deg, #1e3a8a 0%, #0c1e4a 100%)",
    foreground: "#eff6ff",
    accent: "#38bdf8",
  },
  emerald: {
    background: "linear-gradient(135deg, #064e3b 0%, #022c22 100%)",
    foreground: "#ecfdf5",
    accent: "#34d399",
  },
  sunset: {
    background: "linear-gradient(135deg, #f97316 0%, #db2777 60%, #7c3aed 100%)",
    foreground: "#fff7ed",
    accent: "#facc15",
  },
  slate: {
    background: "linear-gradient(135deg, #334155 0%, #0f172a 100%)",
    foreground: "#f1f5f9",
    accent: "#60a5fa",
  },
  frost: {
    background: "linear-gradient(135deg, #f8fafc 0%, #dbeafe 100%)",
    foreground: "#0f172a",
    accent: "#0284c7",
  },
  midnight: {
    background: "linear-gradient(135deg, #312e81 0%, #0b0b1f 100%)",
    foreground: "#eef2ff",
    accent: "#a78bfa",
  },
};
