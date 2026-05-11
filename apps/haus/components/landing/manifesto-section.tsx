"use client";

import { useState } from "react";
import { AccordionRow, SectionHeader } from "./shared";

interface PrincipleItem {
  title: string;
  description: string;
}

interface ManifestoSectionProps {
  label: string;
  title: string;
  items: PrincipleItem[];
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
          <p className="text-sm leading-7 text-muted-foreground max-w-2xl">{item.description}</p>
        </AccordionRow>
      ))}
    </div>
  );
}

export function ManifestoSection({ label, title, items }: ManifestoSectionProps) {
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
