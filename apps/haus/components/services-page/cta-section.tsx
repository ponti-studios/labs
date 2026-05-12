"use client";

import { useTranslations } from "@/i18n/client";
import { CTA_STEPS } from "./data";

export function CtaSection() {
  const t = useTranslations("ServicesPage");

  return (
    <section className="border-b border-border bg-muted">
      <div className="container py-20 md:py-28">
        <div className="card p-8 md:p-12">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <span className="eyebrow">{t("cta.eyebrow")}</span>
              <h2 className="max-w-3xl section-heading">{t("cta.title")}</h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
                {t("cta.description")}
              </p>
              <div className="mt-6 space-y-2">
                {CTA_STEPS.map((step, idx) => (
                  <div key={step} className="flex gap-3 text-sm text-muted-foreground">
                    <span className="shrink-0 font-semibold tabular-nums text-foreground">
                      {idx + 1}.
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
              <a
                href={`mailto:${t("cta.email")}`}
                className="rounded-none bg-foreground px-6 py-3 text-center text-sm font-semibold uppercase tracking-wider text-background hover:opacity-90"
              >
                {t("cta.email")}
              </a>
              <a
                href="https://cal.com/ponti-studios"
                className="rounded-none border border-foreground px-6 py-3 text-center text-sm font-semibold uppercase tracking-wider transition-colors hover:bg-foreground hover:text-background"
              >
                {t("cta.bookCall")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
