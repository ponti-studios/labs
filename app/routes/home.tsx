import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { memo } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";

import { Button } from "@ponti-studios/ui/primitives";
import { Link } from "react-router";
import { RevealGroup, RevealItem } from "~/components/Reveal";
import { FeaturedProjects } from "~/components/projects-wallet/projects-wallet";
import { BOOK_CALL_URL } from "~/data/studio";
import { t } from "~/translations";

import "~/routes/games/what/what.css";

export function meta(): Array<{
  title?: string;
  name?: string;
  content?: string;
}> {
  return [{ title: t.home.meta.title }, { name: "description", content: t.home.meta.description }];
}

const MotionLink = motion.create(Link);
const CHIP_TILT_DEGREES = 5;

type ServiceChipProps = {
  name: string;
  slug: string;
};

const ServiceChip = memo(function ServiceChip({ name, slug }: ServiceChipProps) {
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const springConfig = { stiffness: 300, damping: 25, mass: 0.5 };
  const rotateX = useSpring(
    useTransform(pointerY, [0, 1], [CHIP_TILT_DEGREES, -CHIP_TILT_DEGREES]),
    springConfig,
  );
  const rotateY = useSpring(
    useTransform(pointerX, [0, 1], [-CHIP_TILT_DEGREES, CHIP_TILT_DEGREES]),
    springConfig,
  );
  const glowX = useTransform(pointerX, [0, 1], ["0%", "100%"]);
  const glowY = useTransform(pointerY, [0, 1], ["0%", "100%"]);
  const glowBackground = useMotionTemplate`radial-gradient(220px circle at ${glowX} ${glowY}, color-mix(in oklab, var(--color-accent) 24%, transparent), transparent 68%)`;

  function handlePointerMove(event: ReactPointerEvent<HTMLAnchorElement>) {
    if (event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width);
    pointerY.set((event.clientY - bounds.top) / bounds.height);
  }

  function handlePointerLeave() {
    pointerX.set(0.5);
    pointerY.set(0.5);
  }

  const motionStyle = (
    reduceMotion ? {} : { rotateX, rotateY, transformPerspective: 800 }
  ) as CSSProperties;

  return (
    <MotionLink
      to={`/services#${slug}`}
      prefetch="intent"
      onPointerMove={reduceMotion ? undefined : handlePointerMove}
      onPointerLeave={reduceMotion ? undefined : handlePointerLeave}
      style={motionStyle}
      whileHover={reduceMotion ? undefined : { scale: 1.015, y: -6 }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group bg-card text-foreground focus-visible:ring-accent relative isolate flex min-h-28 flex-col justify-between overflow-hidden rounded-2xl border border-white/10 p-4 shadow-lg shadow-black/10 transition-shadow duration-200 hover:shadow-black/25 focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none sm:min-h-32 sm:p-5"
    >
      {!reduceMotion && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: glowBackground }}
        />
      )}
      <span className="relative z-10 flex items-center justify-between gap-3 text-lg font-semibold tracking-tight">
        {name}
        <span aria-hidden="true" className="text-accent text-2xl leading-none">
          ↗
        </span>
      </span>
    </MotionLink>
  );
});

function HeroHeadline() {
  const reduceMotion = useReducedMotion();
  const after = t.home.hero.wordAfter;
  return (
    <h1 className="text-foreground text-[clamp(1.875rem,8vw,3.75rem)] tracking-tighter">
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
    <div className="page-bleed flex flex-col gap-10">
      {/* Thesis */}
      <section className="flex flex-col gap-4 px-4 py-16 sm:px-6 md:py-24">
        <div className="max-w-5xl">
          <HeroHeadline />
          <p className="text-muted-foreground">{t.home.hero.subtitle}</p>
        </div>

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
          {t.home.capabilities.groups.map((group) => (
            <div key={group.title} className="flex flex-col gap-3">
              <h3 className="text-muted-foreground text-xs font-black tracking-[0.18em] uppercase">
                {group.title}
              </h3>
              <RevealGroup className="grid gap-3 sm:grid-cols-2">
                {group.services.map((service) => (
                  <RevealItem key={service.slug}>
                    <ServiceChip name={service.title} slug={service.slug} />
                  </RevealItem>
                ))}
              </RevealGroup>
            </div>
          ))}
        </div>
      </section>

      {/* Selected work */}
      <FeaturedProjects />

      {/* Point of view */}
      <section className="bg-accent-foreground rounded-4xl px-6 py-14 sm:px-12 md:py-20">
        <p className="text-background max-w-4xl text-3xl leading-[1.1] font-semibold tracking-tight sm:text-4xl md:text-5xl">
          “{t.manifesto.quote}”
        </p>
      </section>

      {/* Close CTA */}
      <section className="bg-accent-foreground text-background flex flex-col items-center rounded-4xl px-4 py-14 sm:px-6 md:py-20">
        <h2 className="heading-cta text-accent mx-auto mb-5 max-w-3xl text-center">
          {t.services.cta.title}
        </h2>
        <p className="text-background/75 mx-auto mb-7 max-w-xl text-center text-lg leading-relaxed">
          {t.services.cta.body}
        </p>
        <Button asChild size="lg" className="press rounded-full px-6">
          <a href={BOOK_CALL_URL} target="_blank" rel="noreferrer">
            {t.common.bookCall}
          </a>
        </Button>
      </section>
    </div>
  );
}
