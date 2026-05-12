"use client";

import { useTranslations } from "next-intl";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import { AccordionRow } from "./ui/accordion-row";

interface ServiceItem {
  title: string;
  copy: string;
}

function RevealHeadline({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-15%" });
  const prefersReduced = useReducedMotion();
  const words = text.split(" ");

  return (
    <h2 ref={ref} className={className} aria-label={text}>
      {words.map((word, wi) => (
        <span key={`${word}-${wi}`} className="inline-block mr-[0.25em]">
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
  const items = t.raw("services.items") as ServiceItem[];
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
          {items.map((item, i) => (
            <AccordionRow
              key={item.title}
              index={i}
              isOpen={openIndex === i}
              onToggleAction={() => toggle(i)}
              title={item.title}
            >
              <p className="text-sm leading-7 text-muted-foreground max-w-2xl">{item.copy}</p>
            </AccordionRow>
          ))}
        </div>
      </div>
    </section>
  );
}
