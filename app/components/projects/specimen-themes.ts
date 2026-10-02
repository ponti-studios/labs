import type { ProjectCategory } from "~/data/projects";

/** Playground items don't carry a real `ProjectCategory` — they get a sixth, distinct finish. */
export type SpecimenCategory = ProjectCategory | "experiment";

export type SpecimenTheme = {
  /** Card face — solid color or gradient, styled as a physical material rather than a screen surface. */
  background: string;
  /** Primary ink color on the card face. */
  foreground: string;
  /** Stamp, rule, and glow color. */
  accent: string;
};

// One grayscale "stock" per category, differentiated by value and finish:
// paper, graphite, chalk, silver, and so on. No hue — the identity is black,
// white, and gray. `experiment` sits on the same shelf as /playground/essays.
export const SPECIMEN_THEMES: Record<SpecimenCategory, SpecimenTheme> = {
  product: {
    background: "linear-gradient(135deg, #fafafa 0%, #e0e0e0 100%)",
    foreground: "#0a0a0a",
    accent: "#262626",
  },
  infrastructure: {
    background: "linear-gradient(135deg, #1c1c1c 0%, #000000 100%)",
    foreground: "#f0f0f0",
    accent: "#ffffff",
  },
  tool: {
    background: "linear-gradient(135deg, #bdbdbd 0%, #8a8a8a 100%)",
    foreground: "#0a0a0a",
    accent: "#1a1a1a",
  },
  library: {
    background: "linear-gradient(135deg, #e8e8e8 0%, #c2c2c2 100%)",
    foreground: "#0a0a0a",
    accent: "#333333",
  },
  research: {
    background: "linear-gradient(135deg, #404040 0%, #171717 100%)",
    foreground: "#f5f5f5",
    accent: "#d4d4d4",
  },
  experiment: {
    background: "linear-gradient(135deg, #f0f0f0 0%, #cfcfcf 100%)",
    foreground: "#0a0a0a",
    accent: "#404040",
  },
};
