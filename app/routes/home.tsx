import { motion, useReducedMotion } from "framer-motion";
import { LucideArrowBigRight } from "lucide-react";
import { Link } from "react-router";
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

function RealiTeaFeaturedCard() {
  return (
    <Link
      to="/games/realitea"
      prefetch="intent"
      data-testid="makers-of-realitea"
      className="border-border bg-card hover:border-accent/50 group grid gap-8 rounded-xl border p-6 transition-colors md:grid-cols-[1fr_auto] md:items-center md:gap-16 md:p-10"
    >
      <div className="flex flex-col gap-3">
        <span className="text-accent bg-accent/10 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide uppercase">
          <span className="bg-accent size-1.5 rounded-full" aria-hidden="true" />
          {t.home.realitea.eyebrow}
        </span>
        <h2 className="text-foreground text-3xl font-bold tracking-tight">
          {t.home.realitea.title}
        </h2>
        <p className="text-muted-foreground max-w-md text-base">{t.home.realitea.description}</p>
        <span className="text-accent mt-2 inline-flex items-center gap-1 text-sm font-semibold transition-[gap] group-hover:gap-2">
          {t.home.realitea.cta}
          <LucideArrowBigRight className="size-4" aria-hidden="true" />
        </span>
      </div>

      <div className="realitea-hero-preview flex flex-col items-center gap-(--realitea-tile-gap) md:shrink-0">
        {PREVIEW_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-(--realitea-tile-gap)">
            {row.map((tile, tileIndex) => (
              <RealiTeaTile key={tileIndex} state={tile.state} letter={tile.letter} />
            ))}
          </div>
        ))}
      </div>
    </Link>
  );
}

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
        <RealiTeaFeaturedCard />
      </section>
    </div>
  );
}
