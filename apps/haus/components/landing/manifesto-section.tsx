"use client";

import { useTranslations } from "@/i18n/client";
import { useState } from "react";
import { AccordionRow } from "./ui/accordion-row";
import { APPROACH } from "./data";

interface PrincipleItem {
  title: string;
  description: string;
}

function KineticPrinciples({ items }: { items: PrincipleItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div>
      {items.map((item, i) => (
        <AccordionRow
          key={item.title}
          index={i}
          isOpen={openIndex === i}
          onToggleAction={() => setOpenIndex(openIndex === i ? null : i)}
          title={item.title}
        >
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">{item.description}</p>
        </AccordionRow>
      ))}
      {APPROACH.map((item, index) => (
        <AccordionRow
          key={item.title}
          index={index}
          isOpen={openIndex === index}
          onToggleAction={() => setOpenIndex(openIndex === index ? null : index)}
          title={item.title}
        >
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">{item.description}</p>
        </AccordionRow>
      ))}
    </div>
  );
}

export function ManifestoSection() {
  const t = useTranslations("Studio");
  const label = t("principles.label");
  const title = t("principles.title");
  const items = t.raw<PrincipleItem[]>("principles.items");

  return (
    <section id="principles" className="border-t border-border">
      <div className="container py-20 md:py-28">
        <div className="mb-16">
          <span className="eyebrow">{label}</span>
          <h2 className="section-heading">{title}</h2>
        </div>
        <KineticPrinciples items={items} />
      </div>
    </section>
  );
}
