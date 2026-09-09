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

// One "stock" per category — a material metaphor instead of `card-themes.ts`'s
// premium finishes: ledger paper, a blueprint, a shop ticket, a catalog card,
// a lab notebook. `experiment` reuses the Cabinet of Small Machines verdigris
// accent on purpose — it's the same shelf as /playground/essays.
export const SPECIMEN_THEMES: Record<SpecimenCategory, SpecimenTheme> = {
  product: {
    background: "linear-gradient(135deg, #efe6d2 0%, #ddcda3 100%)",
    foreground: "#2c2114",
    accent: "#a4402a",
  },
  infrastructure: {
    background: "linear-gradient(135deg, #123a63 0%, #071f38 100%)",
    foreground: "#d9ecff",
    accent: "#6fc6ff",
  },
  tool: {
    background: "linear-gradient(135deg, #d9b878 0%, #a9793c 100%)",
    foreground: "#2a1c08",
    accent: "#5b3410",
  },
  library: {
    background: "linear-gradient(135deg, #f1e8d6 0%, #cdb98d 100%)",
    foreground: "#241c0f",
    accent: "#6b4a23",
  },
  research: {
    background: "linear-gradient(135deg, #e6f0e3 0%, #b9d3bb 100%)",
    foreground: "#16241a",
    accent: "#2f7a4d",
  },
  experiment: {
    background: "linear-gradient(135deg, #efe9df 0%, #c9c0ac 100%)",
    foreground: "#211d19",
    accent: "#3e6a61",
  },
};
