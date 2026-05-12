"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { AccordionRow, SectionHeader } from "./shared";

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
          onToggle={() => setOpenIndex(openIndex === i ? null : i)}
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
  const items = t.raw("principles.items") as PrincipleItem[];

  return (
    <section id="principles" className="border-t border-border bg-background">
      <div className="container py-20 md:py-28">
        <div className="mb-16">
          <SectionHeader label={label} title={title} />
        </div>
        <KineticPrinciples items={items} />
      </div>
    </section>
  );
}
