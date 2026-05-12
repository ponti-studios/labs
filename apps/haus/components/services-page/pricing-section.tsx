"use client";

import { useTranslations } from "next-intl";
import { PRICING_RANGES } from "./data";
import { Card } from "./shared";

export function PricingSection() {
  const t = useTranslations("ServicesPage");

  return (
    <section className="border-b border-border bg-muted">
      <div className="container py-20 md:py-28">
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          {t("pricing.eyebrow")}
        </span>
        <h2 className="mt-3 text-3xl font-normal uppercase tracking-[-0.04em]">
          {t("pricing.title")}
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
          {t("pricing.description")}
        </p>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <Card>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {t("pricing.moreTitle")}
            </p>
            <ul className="space-y-2">
              {[
                "We hire senior practitioners, not junior contractors",
                "We build for the long-term, not just launch day",
                "We include quality assurance and testing in everything",
                "We document our work so you're not dependent on us",
                "We stick around to make sure it works",
              ].map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-6 text-foreground">
                  <span className="shrink-0 mt-0.5 text-muted-foreground">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {t("pricing.worthTitle")}
            </p>
            <ul className="space-y-2">
              {[
                "Lower total cost of ownership (less rework, fewer bugs)",
                "Faster time to meaningful value (we know what we're doing)",
                "Better outcomes (quality drives retention and growth)",
                "Strategic partnership (we make you smarter about product)",
                "Peace of mind (you can trust we'll deliver)",
              ].map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-6 text-foreground">
                  <span className="shrink-0 mt-0.5 text-muted-foreground">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card className="mt-5">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {t("pricing.rangesTitle")}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PRICING_RANGES.map((item) => (
              <div
                key={item.label}
                className="flex items-baseline justify-between border-b border-border pb-3"
              >
                <span className="text-sm uppercase tracking-widest text-muted-foreground">
                  {item.label}
                </span>
                <span className="text-sm font-semibold tabular-nums">{item.range}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-muted-foreground">{t("pricing.note")}</p>
        </Card>
      </div>
    </section>
  );
}
