import { Button } from "@pontistudios/ui";
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
    <section className="border-border/60 border-b px-6 py-16 underline-offset-4 hover:cursor-pointer hover:underline">
      <Link to={to} className="body-2 flex justify-between">
        <h2 className="heading-2 text-foreground font-bold">{title}</h2>
        <LucideArrowBigRight className="text-accent" aria-hidden="true" />
      </Link>
    </section>
  );
}

/**
 * "Problems" sits still — the arrow draws in, then "Solved." cuts in.
 * One reveal, once, on load — not a loop. Respects reduced motion.
 */
function HeroHeadline() {
  const reduceMotion = useReducedMotion();
  return (
    <h1 className="display-1 text-foreground flex max-w-4xl flex-wrap items-baseline gap-x-4 gap-y-1">
      <span>{t.home.hero.wordBefore}</span>
      <motion.span
        aria-hidden="true"
        className="text-muted-foreground/40 inline-block origin-left"
        initial={reduceMotion ? false : { scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.2, ease: "easeOut" }}
      >
        →
      </motion.span>
      <span className="sr-only">, </span>
      <motion.span
        className="text-accent"
        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.55, ease: "easeOut" }}
      >
        {t.home.hero.wordAfter}
      </motion.span>
    </h1>
  );
}

export default function Home() {
  return (
    <div className="mx-auto flex w-full flex-col">
      {/* Hero */}
      <section className="border-border/60 flex flex-col gap-6 border-b px-4 py-20 md:flex-row md:justify-between">
        <div>
          <HeroHeadline />
          <p className="body-1 text-muted-foreground max-w-2xl">{t.home.hero.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-6 pt-2">
          <Button asChild size="lg" variant="default">
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
