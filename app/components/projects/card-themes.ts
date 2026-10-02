export type CardThemeName =
  | "obsidian"
  | "game"
  | "graphite"
  | "platinum"
  | "slate"
  | "frost"
  | "midnight"
  | "paper";

export type CardTheme = {
  /** Card face — solid color or gradient. */
  background: string;
  /** Primary text color on the card face. */
  foreground: string;
  /** Badge, glow, and CTA color. */
  accent: string;
};

// Grayscale "card stock" skins — the studio identity is black, white, and gray,
// so every card differs by value (light to dark) and finish, never by hue.
// `game` is the Newsboy card's fixed black finish; it stays static on purpose so
// the card doesn't flip light/dark with the visitor's system theme.
export const CARD_THEMES: Record<CardThemeName, CardTheme> = {
  obsidian: {
    background: "linear-gradient(135deg, #1a1a1a 0%, #000000 100%)",
    foreground: "#f5f5f5",
    accent: "#ffffff",
  },
  game: {
    background: "linear-gradient(135deg, #262626 0%, #0f0f0f 50%, #000000 100%)",
    foreground: "#fafafa",
    accent: "#ffffff",
  },
  graphite: {
    background: "linear-gradient(135deg, #3a3a3a 0%, #141414 100%)",
    foreground: "#f0f0f0",
    accent: "#d4d4d4",
  },
  platinum: {
    background: "linear-gradient(135deg, #d9d9d9 0%, #9a9a9a 100%)",
    foreground: "#0a0a0a",
    accent: "#262626",
  },
  slate: {
    background: "linear-gradient(135deg, #525252 0%, #1c1c1c 100%)",
    foreground: "#f5f5f5",
    accent: "#e5e5e5",
  },
  frost: {
    background: "linear-gradient(135deg, #fafafa 0%, #d4d4d4 100%)",
    foreground: "#0a0a0a",
    accent: "#404040",
  },
  midnight: {
    background: "linear-gradient(135deg, #1f1f1f 0%, #050505 100%)",
    foreground: "#ededed",
    accent: "#a3a3a3",
  },
  paper: {
    background: "linear-gradient(135deg, #ffffff 0%, #ececec 100%)",
    foreground: "#0a0a0a",
    accent: "#525252",
  },
};
