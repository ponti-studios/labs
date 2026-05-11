"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import { AccordionRow, SectionLabel } from "./shared";

interface ServiceItem {
  title: string;
  copy: string;
}

interface ServicesSectionProps {
  label: string;
  title: string;
  subtitle: string;
  items: ServiceItem[];
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

export function ServicesSection({ label, title, subtitle, items }: ServicesSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section id="services" className="border-y border-border bg-muted/30">
      <div className="container py-20 md:py-28">

        {/* Header — RevealHeadline handles the animated heading; SectionLabel provides the eyebrow */}
        <div className="mb-16 grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <SectionLabel>{label}</SectionLabel>
            <RevealHeadline
              text={title}
              className="mt-3 text-3xl font-normal uppercase tracking-[-0.04em]"
            />
          </div>
          <div className="flex items-end">
            <p className="text-sm leading-7 text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        {/* Numbered accordion list */}
        <div>
          {items.map((item, i) => (
            <AccordionRow
              key={item.title}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => toggle(i)}
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
