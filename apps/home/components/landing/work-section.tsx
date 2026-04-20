"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

interface ServiceItem {
  title: string;
  copy: string;
}

interface ClientItem {
  name: string;
  type: string;
  metric: string;
  metricLabel: string;
  blurb: string;
}

interface WorkSectionProps {
  servicesLabel: string;
  servicesTitle: string;
  servicesSubtitle: string;
  servicesItems: ServiceItem[];
  workLabel: string;
  workTitle: string;
  workSubtitle: string;
  clients: ClientItem[];
}

// Animated headline that reveals character-by-character on scroll entry
function RevealHeadline({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-15%" });
  const prefersReduced = useReducedMotion();

  const words = text.split(" ");

  return (
    <h2 ref={ref} className={className} aria-label={text}>
      {words.map((word, wi) => (
        <span key={wi} className="inline-block mr-[0.25em]">
          {word.split("").map((char, ci) => (
            <motion.span
              key={ci}
              className="inline-block overflow-hidden"
              style={{ display: "inline-block" }}
            >
              <motion.span
                style={{ display: "inline-block" }}
                initial={{ y: prefersReduced ? 0 : "100%" }}
                animate={isInView || prefersReduced ? { y: 0 } : {}}
                transition={{
                  duration: 0.45,
                  ease: [0.16, 1, 0.3, 1],
                  delay: prefersReduced ? 0 : (wi * word.length + ci) * 0.022,
                }}
              >
                {char}
              </motion.span>
            </motion.span>
          ))}
        </span>
      ))}
    </h2>
  );
}

// Horizontal drag scroller
function ClientScroller({ clients }: { clients: ClientItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="overflow-hidden -mx-4 px-4 md:-mx-8 md:px-8">
      <motion.div
        ref={containerRef}
        drag="x"
        dragConstraints={{ right: 0, left: -(clients.length - 1.5) * 320 }}
        dragElastic={0.08}
        dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
        className="flex gap-5 cursor-grab active:cursor-grabbing select-none"
        style={{ width: `${clients.length * 320 + (clients.length - 1) * 20}px` }}
      >
        {clients.map((client, i) => (
          <motion.div
            key={client.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-5%" }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            className="shrink-0 w-75 border border-border bg-background p-7 flex flex-col justify-between"
            style={{ minHeight: "260px" }}
          >
            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  {client.type}
                </span>
              </div>
              <div className="mb-2">
                <span className="text-4xl font-normal tracking-tight tabular-nums">
                  {client.metric}
                </span>
                <span className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mt-1">
                  {client.metricLabel}
                </span>
              </div>
            </div>
            <div>
              <div className="text-lg font-normal uppercase tracking-[-0.03em] mb-3">
                {client.name}
              </div>
              <p className="text-sm leading-6 text-muted-foreground">{client.blurb}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
      <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground opacity-50">
        ← drag to explore →
      </p>
    </div>
  );
}

export function WorkSection({
  servicesLabel,
  servicesTitle,
  servicesSubtitle,
  servicesItems,
  workLabel,
  workTitle,
  workSubtitle,
  clients,
}: WorkSectionProps) {
  return (
    <section id="services" className="border-y border-border bg-muted">
      <div className="container py-20 md:py-28">
        {/* Services */}
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {servicesLabel}
            </span>
            <RevealHeadline
              text={servicesTitle}
              className="mt-3 text-3xl font-normal uppercase tracking-[-0.04em]"
            />
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">{servicesSubtitle}</p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {servicesItems.map((service) => (
            <div
              key={service.title}
              className="rounded-none border border-border bg-background p-7"
            >
              <div className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {service.title}
              </div>
              <p className="text-lg leading-8 text-foreground">{service.copy}</p>
            </div>
          ))}
        </div>

        {/* Work / Case Studies */}
        <div id="work" className="mt-20 border-t border-border pt-20">
          <div className="mb-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {workLabel}
              </span>
              <RevealHeadline
                text={workTitle}
                className="mt-3 text-3xl font-normal uppercase tracking-[-0.04em]"
              />
            </div>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">{workSubtitle}</p>
          </div>

          <ClientScroller clients={clients} />
        </div>
      </div>
    </section>
  );
}
