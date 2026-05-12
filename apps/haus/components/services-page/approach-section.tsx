"use client";

import { useTranslations } from "next-intl";
import { APPROACH } from "./data";
import { Card } from "./shared";

export function ApproachSection() {
  const t = useTranslations("ServicesPage");

  return (
    <section className="border-b border-border bg-muted">
      <div className="container py-20 md:py-28">
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          {t("approach.eyebrow")}
        </span>
        <h2 className="mt-3 text-3xl font-normal uppercase tracking-[-0.04em]">
          {t("approach.title")}
        </h2>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {APPROACH.map((item) => (
            <Card key={item.title}>
              <p className="text-base font-semibold uppercase tracking-[-0.02em]">{item.title}</p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
