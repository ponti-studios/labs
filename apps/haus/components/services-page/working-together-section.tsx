"use client";

import { useTranslations } from "next-intl";
import { TOGETHER_GAINS, TOGETHER_NEEDS } from "./data";
import { Card } from "./shared";

export function WorkingTogetherSection() {
  const t = useTranslations("ServicesPage");

  return (
    <section className="border-b border-border bg-background">
      <div className="container py-20 md:py-28">
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          {t("together.eyebrow")}
        </span>
        <h2 className="mt-3 text-3xl font-normal uppercase tracking-[-0.04em]">
          {t("together.title")}
        </h2>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <Card>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {t("together.needTitle")}
            </p>
            <ul className="space-y-4">
              {TOGETHER_NEEDS.map((item) => (
                <li key={item.title} className="flex gap-3">
                  <span className="w-24 shrink-0 pt-0.5 text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
                    {item.title}
                  </span>
                  <span className="text-sm leading-6 text-muted-foreground">{item.description}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {t("together.getTitle")}
            </p>
            <ul className="space-y-4">
              {TOGETHER_GAINS.map((item) => (
                <li key={item.title} className="flex gap-3">
                  <span className="w-24 shrink-0 pt-0.5 text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
                    {item.title}
                  </span>
                  <span className="text-sm leading-6 text-muted-foreground">{item.description}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </section>
  );
}
