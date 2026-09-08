import { motion, useReducedMotion } from "framer-motion";
import { memo } from "react";

import { Button } from "@ponti-studios/ui/primitives";
import { Link } from "react-router";
import { RevealGroup, RevealItem } from "~/components/Reveal";
import { TiltCard } from "~/components/TiltCard";
import { FeaturedClients } from "~/components/clients";
import { FeaturedProjects } from "~/components/projects";
import { BOOK_CALL_URL, servicePillars } from "~/data/studio";
import { t } from "~/translations";

import "~/components/games/game.css";

export function meta(): Array<{
  title?: string;
  name?: string;
  content?: string;
}> {
  return [{ title: t.home.meta.title }, { name: "description", content: t.home.meta.description }];
}

type ServiceChipProps = {
  name: string;
  slug: string;
};

const ServiceChip = memo(function ServiceChip({ name, slug }: ServiceChipProps) {
  return (
    <TiltCard
      to={`/services#${slug}`}
      prefetch="intent"
      glow={{ radiusPx: 220 }}
      className="bg-card text-foreground focus-visible:ring-accent flex flex-col justify-between gap-2 rounded-2xl border border-white/10 p-4 shadow-lg shadow-black/10 transition-shadow duration-200 hover:shadow-black/25 focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none"
    >
      <span className="relative z-10 flex items-center justify-between gap-3 text-lg font-semibold tracking-tight">
        {name}
        <span aria-hidden="true" className="text-accent text-2xl leading-none">
          ↗
        </span>
      </span>
    </TiltCard>
  );
});

function HeroHeadline() {
  const reduceMotion = useReducedMotion();
  const after = t.home.hero.wordAfter;
  return (
    <h1 className="heading-hero text-foreground max-w-4xl">
      <span>{t.home.hero.wordBefore}</span>{" "}
      <motion.span
        className="text-accent font-serif italic"
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
    <div className="page-shell flex flex-col gap-10">
      {/* Thesis */}
      <section className="layout-stack">
        <HeroHeadline />
        <p className="text-muted-foreground max-w-5xl">{t.home.hero.subtitle}</p>

        <div className="grid gap-7 md:grid-cols-[minmax(0,0.9fr)_minmax(16rem,0.5fr)] md:items-end">
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="press rounded-full px-6">
              <a href={BOOK_CALL_URL} target="_blank" rel="noreferrer">
                {t.common.bookCall}
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="press rounded-full px-6">
              <Link to="/work" prefetch="intent">
                {t.home.hero.secondaryCta}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Offer */}
      <section
        aria-labelledby="capabilities-title"
        className="bg-accent-foreground flex flex-col gap-8 rounded-4xl px-4 py-10 sm:px-6 md:py-14"
      >
        <h2 id="capabilities-title" className="heading-cta text-accent max-w-3xl">
          {t.home.capabilities.title}
        </h2>
        <div className="grid gap-8 md:grid-cols-2">
          {servicePillars.map((pillar) => (
            <div key={pillar.name} className="flex flex-col gap-3">
              <h3 className="text-muted-foreground text-xs font-black tracking-[0.18em] uppercase">
                {pillar.name}
              </h3>
              <RevealGroup className="grid gap-3 sm:grid-cols-2">
                {pillar.services.map((service) => (
                  <RevealItem key={service.slug}>
                    <ServiceChip name={service.name} slug={service.slug} />
                  </RevealItem>
                ))}
              </RevealGroup>
            </div>
          ))}
        </div>
      </section>

      {/* Clients */}
      <FeaturedClients />

      {/* Projects */}
      <FeaturedProjects />

      {/* Point of view */}
      <section className="bg-accent-foreground rounded-4xl px-6 py-14 sm:px-12 md:py-20">
        <p className="text-background max-w-4xl text-3xl leading-[1.1] font-semibold tracking-tight sm:text-4xl md:text-5xl">
          “{t.manifesto.quote}”
        </p>
      </section>

      {/* Close CTA */}
      <section className="border-accent-foreground bg-accent/75 text-background flex flex-col items-center gap-4 rounded-4xl border px-4 py-14 sm:px-6">
        <h2 className="heading-cta mx-auto mb-5 flex max-w-3xl gap-4 text-center">
          <span>{t.services.cta.title.split(" ")[0]}</span>
          <span className="font-serif lowercase italic">{t.services.cta.title.split(" ")[1]}</span>
        </h2>
        <Button asChild size="lg">
          <a href={BOOK_CALL_URL} target="_blank" rel="noreferrer">
            {t.common.bookCall}
          </a>
        </Button>
      </section>
    </div>
  );
}
