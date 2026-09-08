import { LucideArrowRightCircle } from "lucide-react";
import { memo } from "react";
import { Link } from "react-router";
import { CardCarousel } from "~/components/CardCarousel";
import { GameTile } from "~/components/games/game-tile";
import { WHAT_APP_URL } from "~/data/game";
import { t } from "~/translations";
import { ProjectCard, type FeaturedProject } from "./project-card";

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
// masked-number band on the game's card face. Relies on the card's `group`
// class (from project-card.tsx) for the hover stagger-lift.
const GameCardPreview = memo(function GameCardPreview() {
  return (
    <div className="game-hero-preview flex flex-col items-center gap-(--game-tile-gap)">
      {PREVIEW_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-(--game-tile-gap)">
          {row.map((tile, tileIndex) => (
            <div
              key={tileIndex}
              className="motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out motion-safe:group-hover:-translate-y-1"
              style={{ transitionDelay: `${(rowIndex * 4 + tileIndex) * 30}ms` }}
            >
              <GameTile state={tile.state} letter={tile.letter} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
});

const FEATURED_PROJECTS: FeaturedProject[] = [
  {
    id: "game",
    href: WHAT_APP_URL,
    isExternal: true,
    logo: "/experiments/logo.webp",
    logoAlt: t.nav.game,
    title: t.home.game.title,
    description: t.home.game.description,
    cta: t.home.game.cta,
    theme: "game",
    status: t.home.game.live,
    preview: <GameCardPreview />,
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
      <div className="flex items-center gap-12">
        <h2 id="capabilities-title" className="heading-cta text-foreground max-w-3xl">
          Projects
        </h2>
        <Link to="/projects" prefetch="intent">
          <LucideArrowRightCircle size={48} />
        </Link>
      </div>
      <CardCarousel
        ariaLabel="Featured projects"
        items={FEATURED_PROJECTS}
        getKey={(project) => project.id}
        renderItem={(project) => (
          <ProjectCard {...project} data-testid={`featured-project-${project.id}`} />
        )}
      />
    </section>
  );
});
