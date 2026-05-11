"use client";

import { SectionLabel, SectionHeading } from "./shared";

interface PrinciplesSectionProps {
  label: string;
  title: string;
  items: Array<{ title: string; description: string }>;
}

export function PrinciplesSection({ label, title, items }: PrinciplesSectionProps) {
  return (
    <section className="border-y border-border bg-foreground text-background">
      <div className="container py-16 md:py-20">
        <div className="max-w-2xl">
          <SectionLabel>{label}</SectionLabel>
          <SectionHeading className="mt-3 text-3xl text-background">{title}</SectionHeading>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.title}
              className="border border-border bg-background p-5 text-foreground"
            >
              <h3 className="text-xl font-normal uppercase tracking-[-0.02em]">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
