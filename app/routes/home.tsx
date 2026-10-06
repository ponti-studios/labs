import { motion, useReducedMotion } from "framer-motion";
import { memo } from "react";

import { Button } from "@ponti-studios/ui/primitives";
import { Link } from "react-router";
import { AsciiField } from "~/components/AsciiField";
import { GlyphText } from "~/components/GlyphText";
import { BookCallButton } from "~/components/BookCallButton";
import { RevealGroup, RevealItem } from "~/components/Reveal";
import { TiltCard } from "~/components/TiltCard";
import { FeaturedClients } from "~/components/clients";
import { FeaturedProjects } from "~/components/projects";
import { servicePillars } from "~/data/studio";
import { pageMeta } from "~/lib/seo";
import { t } from "~/translations";

import "~/components/games/game.css";

export function meta() {
  return pageMeta({
    title: t.home.meta.title,
    description: t.home.meta.description,
    path: "/",
  });
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
      glow={{ radiusPx: 220, color: "var(--color-background)" }}
      className="group/chip text-background border-background/20 hover:border-background focus-visible:ring-background focus-visible:ring-offset-foreground flex flex-col justify-between gap-2 rounded-sm border p-4 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <span className="relative z-10 flex items-center justify-between gap-3 text-lg font-semibold tracking-tight">
        {name}
        <span
          aria-hidden="true"
          className="text-background/60 group-hover/chip:text-background group-focus-visible/chip:text-background font-mono text-xl leading-none"
        >
          <span className="group-hover/chip:hidden group-focus-visible/chip:hidden">↗</span>
          <span className="hidden group-hover/chip:inline group-focus-visible/chip:inline">→</span>
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
      <span className="block">{t.home.hero.wordBefore}</span>
      <motion.span
        className="block"
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
        <span aria-hidden="true" className="cursor-block" />
      </motion.span>
    </h1>
  );
}

export default function Home() {
  return (
    <div className="page-shell flex flex-col gap-16 sm:gap-24">
      {/* Thesis */}
      <section className="layout-stack relative isolate py-16 sm:py-24">
        <AsciiField className="opacity-25 lg:opacity-100" />
        <HeroHeadline />
        <p className="text-muted-foreground max-w-md text-lg leading-relaxed">
          {t.home.hero.subhead}
        </p>

        <div className="grid gap-7 md:grid-cols-[minmax(0,0.9fr)_minmax(16rem,0.5fr)] md:items-end">
          <div className="flex flex-wrap gap-3">
            <BookCallButton>{t.common.bookCall}</BookCallButton>
            <Button asChild size="lg" variant="outline" className="press rounded-sm px-6">
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
        className="bg-foreground text-background flex flex-col gap-8 rounded-sm px-4 py-10 sm:px-6 md:py-14"
      >
        <h2 id="capabilities-title" className="heading-cta text-background max-w-3xl">
          <GlyphText text={t.home.capabilities.title} />
        </h2>
        <div className="grid gap-8 md:grid-cols-2">
          {servicePillars.map((pillar) => (
            <div
              key={pillar.name}
              role="group"
              aria-label={pillar.name}
              className="flex flex-col gap-3"
            >
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
      <section className="bg-foreground rounded-sm px-6 py-14 sm:px-12 md:py-20">
        <p className="text-background max-w-4xl text-3xl leading-[1.1] font-semibold tracking-tight sm:text-4xl md:text-5xl">
          “{t.manifesto.quote}”
        </p>
      </section>

      {/* Close CTA */}
      <section className="border-border relative isolate flex flex-col items-center gap-4 overflow-hidden border-t px-4 py-20 sm:px-6 sm:py-28">
        <AsciiField className="[mask-image:radial-gradient(ellipse_55%_70%_at_50%_50%,transparent_15%,black_80%)]" />
        <h2 className="heading-cta text-foreground mx-auto mb-5 max-w-3xl text-center">
          <GlyphText text={t.services.cta.title} />
        </h2>
        <BookCallButton>{t.common.bookCall}</BookCallButton>
      </section>
    </div>
  );
}
