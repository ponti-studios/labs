import { Button } from "@ponti-studios/ui/primitives";
import { motion, useReducedMotion } from "framer-motion";
import { LucideArrowBigRight } from "lucide-react";
import { Link } from "react-router";
import { BOOK_CALL_URL } from "~/data/studio";
import { t } from "~/translations";

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
        <h2 className="text-foreground text-xl font-bold font-semibold tracking-tight">{title}</h2>
        <LucideArrowBigRight className="text-accent" aria-hidden="true" />
      </Link>
    </section>
  );
}

/**
 * "Building" sits still. "what should exist." fades in letter by letter in accent blue.
 */
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

export default function Home() {
  return (
    <div className="page-bleed">
      {/* Hero */}
      <section className="section section-hero md:flex-row md:justify-between">
        <div>
          <HeroHeadline />
          <p className="text-muted-foreground max-w-2xl text-base">{t.home.hero.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-6 pt-2">
          <Button asChild variant="default">
            <a href={BOOK_CALL_URL} target="_blank" rel="noreferrer">
              {t.common.bookCall}
            </a>
          </Button>
        </div>
      </section>

      {/* Teasers */}

      <Teaser title={t.home.work.title} to="/work" />

      <Teaser title={t.home.projects.title} to="/projects" />

      <Teaser title={t.home.services.cta} to="/services" />

      <Teaser title={t.home.principles.title} to="/manifesto" />
    </div>
  );
}
