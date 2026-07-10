import { Button } from "@pontistudios/ui";
import { motion, useReducedMotion } from "framer-motion";
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

/** Points at the page that owns this content — never a second copy of it. */
function Teaser({
  title,
  intro,
  cta,
  to,
}: {
  title: string;
  intro: string;
  cta: string;
  to: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="heading-2 text-foreground">{title}</h2>
      <p className="body-1 text-muted-foreground max-w-2xl">{intro}</p>
      <Link to={to} className="body-2 text-foreground w-fit underline-offset-4 hover:underline">
        {cta}
      </Link>
    </div>
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
    <div className="flex w-full flex-col">
      {/* Hero */}
      <section className="border-border/60 flex flex-col gap-6 border-b px-6 py-20 sm:px-10 sm:py-28">
        <HeroHeadline />
        <p className="body-1 text-muted-foreground max-w-2xl">{t.home.hero.subtitle}</p>
        <div className="flex flex-wrap items-center gap-6 pt-2">
          <Button asChild size="lg">
            <a href={BOOK_CALL_URL} target="_blank" rel="noreferrer">
              {t.common.bookCall}
            </a>
          </Button>
          <Link
            to="/services"
            className="body-2 text-foreground underline-offset-4 hover:underline"
          >
            {t.home.hero.seeServices}
          </Link>
        </div>
      </section>

      {/* Teasers — full catalog / work / manifesto live on their own routes */}
      <section className="border-border/60 border-b px-6 py-16 sm:px-10 sm:py-20">
        <Teaser
          title={t.home.services.title}
          intro={t.home.services.intro}
          cta={t.home.services.cta}
          to="/services"
        />
      </section>

      <section className="border-border/60 border-b px-6 py-16 sm:px-10 sm:py-20">
        <Teaser
          title={t.home.work.title}
          intro={t.home.work.intro}
          cta={t.home.work.cta}
          to="/work"
        />
      </section>

      <section className="border-border/60 border-b px-6 py-16 sm:px-10 sm:py-20">
        <Teaser
          title={t.home.principles.title}
          intro={t.home.principles.intro}
          cta={t.home.principles.cta}
          to="/manifesto"
        />
      </section>

      {/* Lab — personal side projects, quieter closing band */}
      <section className="flex flex-col gap-10 px-6 py-20 sm:px-10 sm:py-24">
        <div className="flex flex-col gap-3">
          <h2 className="heading-2 text-foreground">{t.home.lab.title}</h2>
          <p className="body-2 text-muted-foreground max-w-2xl">{t.home.lab.description}</p>
        </div>
        <div className="grid gap-12 sm:grid-cols-2 sm:gap-16">
          {t.home.lab.categories.map((cat) => (
            <div key={cat.name} className="flex flex-col gap-4">
              <h3 className="heading-4 text-accent">{cat.name}</h3>
              <ul className="flex flex-col gap-2">
                {cat.entries.map((entry) => (
                  <li key={entry.path}>
                    <a
                      href={entry.path}
                      title={
                        "source" in entry ? `${t.home.lab.sourcePrefix} ${entry.source}` : undefined
                      }
                      className="body-2 text-foreground hover:text-muted-foreground focus-visible:outline-ring rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
                    >
                      {entry.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
