export type PlaygroundItem = {
  slug: string;
  name: string;
  shortDescription: string;
  href: string;
};

// Unpolished, in-progress explorations — kept separate from `projects.ts` (the
// portfolio catalog) since these don't carry the full project metadata (tech,
// status, github, etc.) and aren't meant to be presented as finished work.
export const playgroundItems: PlaygroundItem[] = [
  {
    slug: "calendar",
    name: "Calendar",
    shortDescription: "A single continuous stream for the day's events, instead of a grid.",
    href: "/experiments/calendar",
  },
  {
    slug: "theatre-management",
    name: "Theater P&L",
    shortDescription: "Screen allocation and profit-and-loss modeling for a theater chain.",
    href: "/experiments/theatre-management",
  },
  {
    slug: "glass",
    name: "Physics of Glass",
    shortDescription:
      "How SVG filters recreate the refraction, dispersion, and light behavior of real glass.",
    href: "/experiments/glass",
  },
  {
    slug: "infinite-scroll",
    name: "Infinite Scroll",
    shortDescription: "A marquee-style hero built from vertically scrolling image strips.",
    href: "/experiments/infinite-scroll",
  },
  {
    slug: "threegl-ai-explainer",
    name: "Particle Field",
    shortDescription: "A tunable three.js particle simulation with live controls.",
    href: "/experiments/threegl-ai-explainer",
  },
  {
    slug: "llm-interface",
    name: "Context Chemistry",
    shortDescription: "An interactive look at how an LLM's context window is assembled from turns.",
    href: "/experiments/llm-interface",
  },
];
