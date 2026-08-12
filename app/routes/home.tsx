import { motion, useReducedMotion } from "framer-motion";
import { LucideArrowBigRight } from "lucide-react";
import { Link } from "react-router";
import { ProjectsWallet } from "~/components/projects-wallet/projects-wallet";
import type { FeaturedProject } from "~/components/projects-wallet/project-card";
import { RealiTeaTile } from "~/routes/games/realitea/realitea-tile";
import { t } from "~/translations";

import "~/routes/games/realitea/realitea.css";

export function meta(): Array<{
  title?: string;
  name?: string;
  content?: string;
}> {
  return [{ title: t.home.meta.title }, { name: "description", content: t.home.meta.description }];
}

function Teaser({ title, to }: { title: string; to: string }) {
  return (
    <section className="section section-compact underline-offset-4 hover:cursor-pointer hover:underline">
      <Link to={to} prefetch="intent" className="flex justify-between text-sm">
        <h2 className="text-foreground text-xl font-semibold tracking-tight">{title}</h2>
        <LucideArrowBigRight className="text-accent" aria-hidden="true" />
      </Link>
    </section>
  );
}

function HeroHeadline() {
  const reduceMotion = useReducedMotion();
  const after = t.home.hero.wordAfter;
  return (
    <h1 className="display-1 text-foreground max-w-4xl">
      <span>{t.home.hero.wordBefore}</span>{" "}
      <motion.span
        className="text-accent"
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.03, delayChildren: 0.3 } },
        }}
      >
        {after.split("").map((char, i) => (
          <motion.span
            key={i}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 },
            }}
          >
            {char}
          </motion.span>
        ))}
      </motion.span>
    </h1>
  );
}

// Spells "TEA" over "REAL" — the two halves of "Realitea".
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
// masked-number band on RealiTea's card face. Relies on the card's `group`
// class (from project-card.tsx) for the hover stagger-lift.
function RealiTeaCardPreview() {
  return (
    <div className="realitea-hero-preview flex flex-col items-center gap-(--realitea-tile-gap)">
      {PREVIEW_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-(--realitea-tile-gap)">
          {row.map((tile, tileIndex) => (
            <div
              key={tileIndex}
              className="motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out motion-safe:group-hover:-translate-y-1"
              style={{ transitionDelay: `${(rowIndex * 4 + tileIndex) * 30}ms` }}
            >
              <RealiTeaTile state={tile.state} letter={tile.letter} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const FEATURED_PROJECTS: FeaturedProject[] = [
  {
    id: "realitea",
    href: "/games/realitea",
    logo: "/experiments/logo.realitea.webp",
    logoAlt: t.nav.realitea,
    title: t.home.realitea.title,
    eyebrow: t.home.realitea.eyebrow,
    description: t.home.realitea.description,
    cta: t.home.realitea.cta,
    theme: "realitea",
    status: t.home.realitea.live,
    preview: <RealiTeaCardPreview />,
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
    eyebrow: t.home.career.eyebrow,
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
    eyebrow: t.home.omiro.eyebrow,
    description: t.home.omiro.description,
    cta: t.home.omiro.cta,
    theme: "midnight",
    status: t.projects.statusLabels.active,
  },
];

export default function Home() {
  return (
    <div className="page-bleed">
      {/* Hero */}
      <section className="section flex items-center gap-6 py-28">
        <HeroHeadline />
      </section>

      {/* Teasers */}

      <Teaser title={t.home.work.title} to="/work" />

      <Teaser title={t.home.projects.title} to="/projects" />

      <Teaser title={t.home.services.cta} to="/services" />

      <Teaser title={t.home.principles.title} to="/manifesto" />

      <section className="flex flex-col gap-6 px-6 py-8">
        <h2 className="text-foreground text-xl font-semibold tracking-tight">Featured Projects</h2>
        <ProjectsWallet projects={FEATURED_PROJECTS} />
      </section>
    </div>
  );
}
