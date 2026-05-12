"use client";

import { useTranslations } from "next-intl";
import { FIT_GOOD_FOR, FIT_NOT_RIGHT } from "./data";
import { Card } from "./shared";

export function FitSection() {
  const t = useTranslations("ServicesPage");

  return (
    <section className="border-b border-border bg-background">
      <div className="container py-20 md:py-28">
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          {t("fit.eyebrow")}
        </span>
        <h2 className="mt-3 text-3xl font-normal uppercase tracking-[-0.04em]">
          {t("fit.title")}
        </h2>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <Card>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {t("fit.goodForTitle")}
            </p>
            <ul className="space-y-2">
              {FIT_GOOD_FOR.map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-6 text-foreground">
                  <span className="shrink-0 mt-0.5 text-muted-foreground">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {t("fit.notRightTitle")}
            </p>
            <ul className="space-y-2">
              {FIT_NOT_RIGHT.map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-6 text-foreground">
                  <span className="shrink-0 mt-0.5 text-muted-foreground">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </section>
  );
}
