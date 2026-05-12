"use client";

import { useTranslations } from "@/i18n/client";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import { AccordionRow } from "./ui/accordion-row";
import { SERVICES } from "../services-page/data";
import type { Service } from "../services-page/types";

function ItemCount({ count }: { count: number }) {
  return (
    <span className="rounded-full border border-border px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
      {count}
    </span>
  );
}

function ServiceContent({ service }: { service: Service }) {
  const rows = [
    ...service.features.map((f) => f.category),
    ...(service.differentiators ? ["What Makes Us Different"] : []),
    ...(service.process ? ["Our Process"] : []),
  ];
  const [openRow, setOpenRow] = useState<string | null>(rows[0] ?? null);
  const toggle = (key: string) => setOpenRow((prev) => (prev === key ? null : key));

  return (
    <div className="pt-2">
      <p className="mb-8 max-w-2xl text-sm leading-7 text-muted-foreground">
        {service.description}
      </p>

      <div className="border-t border-border">
        {service.features.map((feature, i) => (
          <AccordionRow
            key={feature.category}
            index={i}
            isOpen={openRow === feature.category}
            onToggleAction={() => toggle(feature.category)}
            title={feature.category}
            badge={<ItemCount count={feature.items.length} />}
          >
            <ul className="space-y-2">
              {feature.items.map((item) => (
                <li key={item} className="dash-list-item">
                  <span className="dash">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </AccordionRow>
        ))}

        {service.differentiators && (
          <AccordionRow
            index={service.features.length}
            isOpen={openRow === "What Makes Us Different"}
            onToggleAction={() => toggle("What Makes Us Different")}
            title="What Makes Us Different"
            badge={<ItemCount count={service.differentiators.length} />}
          >
            <ul className="space-y-2">
              {service.differentiators.map((item) => (
                <li key={item} className="dash-list-item">
                  <span className="dash">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </AccordionRow>
        )}

        {service.process && (
          <AccordionRow
            index={service.features.length + (service.differentiators ? 1 : 0)}
            isOpen={openRow === "Our Process"}
            onToggleAction={() => toggle("Our Process")}
            title="Our Process"
            badge={<ItemCount count={service.process.length} />}
          >
            <ol className="space-y-2">
              {service.process.map((step, idx) => (
                <li key={step} className="dash-list-item">
                  <span className="shrink-0 tabular-nums text-muted-foreground">{idx + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </AccordionRow>
        )}
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div className="card">
          <p className="mb-5 eyebrow">Typical Engagement</p>
          <dl className="space-y-3">
            <div className="flex gap-4">
              <dt className="w-24 shrink-0 pt-0.5 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Duration
              </dt>
              <dd className="text-sm text-foreground">{service.engagement.duration}</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-24 shrink-0 pt-0.5 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Team
              </dt>
              <dd className="text-sm text-foreground">{service.engagement.team}</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-24 shrink-0 pt-0.5 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Delivery
              </dt>
              <dd className="text-sm text-foreground">{service.engagement.delivery}</dd>
            </div>
            <div className="mt-3 flex gap-4 border-t border-border pt-3">
              <dt className="w-24 shrink-0 pt-0.5 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Investment
              </dt>
              <dd className="text-sm font-semibold text-foreground">
                {service.engagement.investment}
              </dd>
            </div>
          </dl>
        </div>

        <div className="card">
          <p className="mb-5 eyebrow">Perfect For</p>
          <ul className="space-y-2">
            {service.perfectFor.map((item) => (
              <li key={item} className="dash-list-item">
                <span className="dash">—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function RevealHeadline({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-15%" });
  const prefersReduced = useReducedMotion();
  const words = text.split(" ");

  return (
    <h2 ref={ref} className={className} aria-label={text}>
      {words.map((word, wi) => (
        <span key={`${word}-${wi}`} className="mr-[0.25em] inline-block">
          {word.split("").map((char, ci) => (
            <motion.span key={`${char}-${ci}`} className="inline-block overflow-hidden">
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

export function OfferingsSection() {
  const t = useTranslations("Studio");
  const label = t("services.label");
  const title = t("services.title");
  const subtitle = t("services.subtitle");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section id="services" className="border-y border-border bg-muted/30">
      <div className="container py-20 md:py-28">
        <div className="mb-16 grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <span className="eyebrow">{label}</span>
            <RevealHeadline text={title} className="section-heading" />
          </div>
          <div className="flex items-end">
            <p className="text-sm leading-7 text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        <div>
          {SERVICES.map((service, i) => (
            <AccordionRow
              key={service.id}
              index={i}
              isOpen={openIndex === i}
              onToggleAction={() => toggle(i)}
              title={service.title}
              aside={
                <span className="hidden text-xs text-muted-foreground md:block">
                  {service.engagement.investment}
                </span>
              }
            >
              <ServiceContent service={service} />
            </AccordionRow>
          ))}
        </div>
      </div>
    </section>
  );
}
