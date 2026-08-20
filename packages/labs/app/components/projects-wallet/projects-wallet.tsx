import { memo } from "react";
import { WhatTile } from "~/components/games/what-tile";
import { t } from "~/translations";
import { ProjectCard, type FeaturedProject } from "./project-card";

type ProjectsWalletProps = {
  projects: FeaturedProject[];
  ariaLabel?: string;
};

/** Horizontally scrollable row of credit-card-styled featured projects. */
export const ProjectsWallet = memo(function ProjectsWallet({
  projects,
  ariaLabel = "Featured projects",
}: ProjectsWalletProps) {
  return (
    <ul
      aria-label={ariaLabel}
      // Cards grow on hover (whileHover: scale 1.015, y: -6 in ProjectCard) and
      // always carry a shadow-lg drop shadow, both of which paint outside the
      // card's own layout box. Since this list clips on both axes (overflow-x-auto
      // forces overflow-y to auto per the CSS spec), anything painted past the box
      // gets cropped unless the list has room to paint into.
      //
      // Worst case is the largest card (sm+: 340x214px):
      //   - shadow-lg is two layers; the dominant one is `0 10px 15px -3px black/20`
      //     (offset 10, blur 15, spread -3), which alone paints ~22px below the box
      //     (10 offset - 3 spread + 15 blur) and ~2px above it. This is present at
      //     rest, not just on hover.
      //   - hover adds translateY -6 (shifts everything, including the shadow, up
      //     6px) and scale 1.015 (grows the box ~1.6px per side vertically, ~2.6px
      //     per side horizontally) plus the shadow's own ~12px horizontal bleed
      //     (10 - 3 spread + 15 blur... offset-x is 0, so symmetric).
      //   - top: max(rest shadow ~2px, hover 6 translate + 1.6 scale + 2 shadow) ≈ 10px
      //   - bottom: max(rest shadow ~22px, hover 22 - 6 + ~1.6) ≈ 22px — the rest
      //     case dominates because translateY only offsets the shadow while hovering
      //   - left/right: ~12px shadow bleed + ~3px scale growth ≈ 15px
      //
      // pt-3/px-4 supply that room with margin to spare; pb-6 covers the bottom
      // shadow. Negative top/horizontal margins keep the row's visible position
      // unchanged so surrounding layout (heading gap, page margins) doesn't shift;
      // the bottom padding is left uncompensated since a little extra breathing
      // room before the next section's border is fine.
      className="-mx-4 -mt-3 flex snap-x snap-mandatory scrollbar-thin gap-6 overflow-x-auto px-4 pt-3 pb-6"
    >
      {projects.map((project) => (
        <li key={project.id} className="shrink-0">
          <ProjectCard {...project} data-testid={`featured-project-${project.id}`} />
        </li>
      ))}
    </ul>
  );
});

const PREVIEW_ROWS = [
  [
    { letter: "B", state: "correct" as const },
    { letter: "T", state: "correct" as const },
    { letter: "C", state: "present" as const },
    { letter: "H", state: "correct" as const },
  ],
  [
    { letter: "", state: "empty" as const },
    { letter: "P", state: "correct" as const },
    { letter: "L", state: "correct" as const },
    { letter: "z", state: "correct" as const },
  ],
];

// Standalone so it can be passed as `ProjectCard`'s `preview` slot — the
// masked-number band on What's card face. Relies on the card's `group`
// class (from project-card.tsx) for the hover stagger-lift.
const WhatCardPreview = memo(function WhatCardPreview() {
  return (
    <div className="what-hero-preview flex flex-col items-center gap-(--what-tile-gap)">
      {PREVIEW_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-(--what-tile-gap)">
          {row.map((tile, tileIndex) => (
            <div
              key={tileIndex}
              className="motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out motion-safe:group-hover:-translate-y-1"
              style={{ transitionDelay: `${(rowIndex * 4 + tileIndex) * 30}ms` }}
            >
              <WhatTile state={tile.state} letter={tile.letter} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
});

const FEATURED_PROJECTS: FeaturedProject[] = [
  {
    id: "what",
    href: "/games/what",
    logo: "/experiments/logo.what.webp",
    logoAlt: t.nav.what,
    title: t.home.what.title,
    description: t.home.what.description,
    cta: t.home.what.cta,
    theme: "what",
    status: t.home.what.live,
    preview: <WhatCardPreview />,
  },
  {
    id: "career",
    href:
      import.meta.env.NODE_ENV === "development"
        ? "https://localhost:4451"
        : "https://career.ponti.io",
    isExternal: true,
    logo: "/experiments/logo.career.500x500.webp",
    logoAlt: t.nav.career,
    title: t.home.career.title,
    description: t.home.career.description,
    cta: t.home.career.cta,
    theme: "slate",
    status: t.home.career.live,
  },
  {
    id: "omiro",
    href: "/projects/omiro",
    logo: "/experiments/logo.omiro.500x500.webp",
    logoAlt: t.projects.entries.omiro.name,
    title: t.home.omiro.title,
    description: t.home.omiro.description,
    cta: t.home.omiro.cta,
    theme: "midnight",
    status: t.projects.statusLabels.active,
  },
];

export const FeaturedProjects = memo(function FeaturedProjects() {
  return (
    <section className="bg-accent flex flex-col gap-8 rounded-4xl px-6 py-12">
      <h2 id="capabilities-title" className="heading-cta text-foreground max-w-3xl">
        Featured Projects
      </h2>
      <ProjectsWallet projects={FEATURED_PROJECTS} />
    </section>
  );
});
