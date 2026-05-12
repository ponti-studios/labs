"use client";

import { useTranslations } from "@/i18n/client";
import { PRICING_RANGES } from "./data";

export function PricingSection() {
  const t = useTranslations("ServicesPage");

  return (
    <section className="border-b border-border bg-muted">
      <div className="container py-20 md:py-28">
        <span className="eyebrow">{t("pricing.eyebrow")}</span>
        <h2 className="section-heading">{t("pricing.title")}</h2>
        <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
          {t("pricing.description")}
        </p>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <div className="card">
            <p className="mb-5 eyebrow">{t("pricing.moreTitle")}</p>
            <ul className="space-y-2">
              {[
                "Senior practitioners -> Lower total cost of ownership (less rework, fewer bugs)",
                "We build for your first million users",
                "We include quality assurance and testing in everything",
                "We document our work so you're not dependent on us",
                "We stick around to make sure it works",
                "Faster time to meaningful value (we know what we're doing)",
                "Better outcomes (quality drives retention and growth)",
                "Strategic partnership (we make you smarter about product)",
                "Peace of mind (you can trust we'll deliver)",
              ].map((item) => (
                <li key={item} className="dash-list-item">
                  <span className="dash">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card mt-5">
            <p className="mb-6 eyebrow">{t("pricing.rangesTitle")}</p>
            <div className="flex flex-col gap-3">
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
          </div>
        </div>
      </div>
    </section>
  );
}
