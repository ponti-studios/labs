import { motion, useReducedMotion } from "framer-motion";
import { LucideArrowBigRight } from "lucide-react";
import { Button } from "@ponti-studios/ui/primitives";
import { Link } from "react-router";
import { Kicker } from "~/components/Kicker";
import { ProjectsWallet } from "~/components/projects-wallet/projects-wallet";
import type { FeaturedProject } from "~/components/projects-wallet/project-card";
import { BOOK_CALL_URL, caseSnapshots } from "~/data/studio";
import { WhatTile } from "~/routes/games/what/what-tile";
import { t } from "~/translations";

import "~/routes/games/what/what.css";

export function meta(): Array<{
  title?: string;
  name?: string;
  content?: string;
}> {
  return [{ title: t.home.meta.title }, { name: "description", content: t.home.meta.description }];
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

function Marquee({ items }: { items: readonly string[] }) {
  const looped = [...items, ...items];
  return (
    <div className="border-border overflow-hidden border-y py-4 whitespace-nowrap" aria-hidden="true">
      <div className="marquee-track">
        {looped.map((item, i) => (
          <span key={i} className="text-foreground/80 mr-11 text-sm font-extrabold sm:mr-12">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// Decorative tile-state showcase for the card preview — letters are illustrative, not a real word.
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
function WhatCardPreview() {
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
}

const FEATURED_PROJECTS: FeaturedProject[] = [
  {
    id: "what",
    href: "/games/what",
    logo: "/experiments/logo.what.webp",
    logoAlt: t.nav.what,
    title: t.home.what.title,
    eyebrow: t.home.what.eyebrow,
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

// Featured on the proof band — pulled from real case-study outcomes so the
// numbers can never drift from what /work/$slug actually claims.
function findSnapshot(slug: string) {
  const snapshot = caseSnapshots.find((entry) => entry.slug === slug);
  if (!snapshot) throw new Error(`Missing case snapshot: ${slug}`);
  return snapshot;
}
const streamyard = findSnapshot("streamyard");
const prolog = findSnapshot("prolog");
const PROOF_METRICS = [streamyard.outcomes[0], streamyard.outcomes[2], prolog.outcomes[0]];

export default function Home() {
  return (
    <div className="page-bleed">
      {/* Hero */}
      <section className="section grid gap-10 pt-16 pb-14 md:grid-cols-[1.35fr_.65fr] md:items-end md:pt-24 md:pb-20">
        <div>
          <Kicker>{t.home.hero.kicker}</Kicker>
          <HeroHeadline />
        </div>
        <div className="flex flex-col gap-7">
          <p className="text-muted-foreground max-w-md text-lg leading-relaxed sm:text-xl">
            {t.home.hero.subtitle}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full px-6">
              <a href={BOOK_CALL_URL} target="_blank" rel="noreferrer">
                {t.common.bookCall}
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-6">
              <Link to="/work" prefetch="intent">
                {t.home.hero.secondaryCta}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Marquee items={t.home.marquee} />

      {/* Capabilities */}
      <section className="section">
        <div className="mb-10 grid gap-8 md:grid-cols-2 md:items-end">
          <h2 className="text-foreground text-4xl leading-[.98] font-semibold tracking-tighter sm:text-5xl md:text-6xl">
            {t.home.capabilities.title}
          </h2>
          <p className="text-muted-foreground max-w-lg text-lg leading-relaxed">
            {t.home.capabilities.intro}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {t.home.capabilities.items.map((item, index) => (
            <div
              key={item.title}
              className={
                "bg-card border-border flex min-h-[260px] flex-col justify-between rounded-[22px] border p-7" +
                (index === 0 || index === 3 ? " sm:col-span-2" : "")
              }
            >
              <span className="text-muted-foreground text-xs font-black tracking-wider">
                {item.index}
              </span>
              <div>
                <h3 className="text-foreground mb-3 text-2xl font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Approach — dark panel, always dark regardless of system theme */}
      <section className="section">
        <div className="rounded-[28px] bg-[#171714] px-6 py-14 text-white sm:px-12 md:py-20">
          <p className="mb-14 max-w-4xl text-3xl leading-[1.1] font-semibold tracking-tight sm:text-4xl md:text-5xl">
            “{t.manifesto.quote}”
          </p>
          <div className="grid gap-8 border-t border-[#383832] pt-8 sm:grid-cols-2 lg:grid-cols-4">
            {t.home.approach.items.map((item) => (
              <div key={item.title} className="flex flex-col gap-2">
                <b className="text-lg">{item.title}</b>
                <p className="text-sm leading-relaxed text-[#aaa79f]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Teasers */}
      <Teaser title={t.home.work.title} to="/work" />
      <Teaser title={t.home.projects.title} to="/projects" />
      <Teaser title={t.home.services.cta} to="/services" />
      <Teaser title={t.home.principles.title} to="/manifesto" />

      {/* Proof */}
      <section className="section">
        <div className="bg-accent grid gap-7 rounded-[28px] p-8 text-[#15110f] sm:p-11 md:grid-cols-2 md:items-end">
          <p className="text-4xl leading-[.9] font-black tracking-tighter sm:text-5xl md:text-6xl">
            {t.home.proof.statement}
          </p>
          <div>
            <p className="max-w-lg text-lg leading-relaxed">{t.home.proof.body}</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {PROOF_METRICS.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-[#11110f]/25 p-4"
                >
                  <b className="block text-2xl tracking-tight sm:text-3xl">{metric.value}</b>
                  <span className="mt-1 block text-[11px] font-black tracking-wide uppercase">
                    {metric.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="section">
        <h2 className="text-foreground mb-6 text-xl font-semibold tracking-tight">
          Featured Projects
        </h2>
        <ProjectsWallet projects={FEATURED_PROJECTS} />
      </section>

      {/* Close CTA */}
      <section className="section-compact border-border border-t border-b py-20 text-center md:py-28">
        <h2 className="text-foreground mx-auto mb-5 max-w-3xl text-4xl leading-[.95] font-semibold tracking-tighter sm:text-5xl md:text-6xl">
          {t.services.cta.title}
        </h2>
        <p className="text-muted-foreground mx-auto mb-7 max-w-xl text-lg leading-relaxed">
          {t.services.cta.body}
        </p>
        <Button asChild size="lg" className="rounded-full px-6">
          <a href={BOOK_CALL_URL} target="_blank" rel="noreferrer">
            {t.common.bookCall}
          </a>
        </Button>
      </section>
    </div>
  );
}
