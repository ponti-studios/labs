import type { CardThemeName } from "~/components/projects/card-themes";
import type { FeaturedProject } from "~/components/projects/project-card";
import { caseLogos, caseSnapshots } from "~/data/studio";
import { t } from "~/translations";

// `game` is excluded — it's a fixed brand skin for the WH?T card, not a
// general-purpose "card stock" for client work.
const CLIENT_CARD_THEMES: readonly CardThemeName[] = [
  "obsidian",
  "platinum",
  "roseGold",
  "cobalt",
  "emerald",
  "sunset",
  "slate",
  "frost",
  "midnight",
];

/** Deterministic per-client "card stock" — same client always gets the same color identity. */
export function clientTheme(index: number): CardThemeName {
  return CLIENT_CARD_THEMES[index % CLIENT_CARD_THEMES.length];
}

export function clientThemeBySlug(slug: string): CardThemeName {
  const index = caseSnapshots.findIndex((snapshot) => snapshot.slug === slug);
  return clientTheme(index < 0 ? 0 : index);
}

/** The credit-card representation of every client, shared by the home carousel and /work grid. */
export const CLIENT_CARDS: readonly FeaturedProject[] = caseSnapshots.map((snapshot, index) => ({
  id: snapshot.slug,
  href: `/work/${snapshot.slug}`,
  logo: caseLogos[snapshot.slug],
  logoAlt: `${snapshot.client} logo`,
  title: snapshot.client,
  description: snapshot.description,
  cta: t.catalog.proof.readCaseStudy,
  theme: clientTheme(index),
  status: snapshot.industry,
}));
