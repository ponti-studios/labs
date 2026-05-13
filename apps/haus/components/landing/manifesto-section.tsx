"use client";

import { useTranslations } from "@/i18n/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@pontistudios/ui";
import { useState } from "react";
import { APPROACH } from "./data";

interface PrincipleItem {
  title: string;
  description: string;
}

function KineticPrinciples({ items }: { items: PrincipleItem[] }) {
  const [openItem, setOpenItem] = useState<string | null>(null);
  const rows = [
    ...items.map((item, index) => ({
      key: `principle-${index}`,
      title: item.title,
      description: item.description,
    })),
    ...APPROACH.map((item, index) => ({
      key: `approach-${index}`,
      title: item.title,
      description: item.description,
    })),
  ];

  return (
    <Accordion
      type="single"
      collapsible
      value={openItem ?? undefined}
      onValueChange={(value) => setOpenItem(value || null)}
    >
      {rows.map((item, index) => (
        <AccordionItem key={item.key} value={item.key}>
          <AccordionTrigger index={index}>{item.title}</AccordionTrigger>
          <AccordionContent>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">{item.description}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
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
