"use client";

import { useTranslations } from "@/i18n/client";
import { ENGAGEMENT_MODELS, PROCESS_STEPS } from "./data";

export function HowWeWorkSection() {
  const t = useTranslations("ServicesPage");

  return (
    <section className="border-b border-border bg-muted">
      <div className="container py-20 md:py-28">
        <span className="eyebrow">{t("work.eyebrow")}</span>
        <h2 className="section-heading">{t("work.title")}</h2>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {ENGAGEMENT_MODELS.map((model) => (
            <div key={model.title} className="card">
              <p className="text-base font-semibold uppercase tracking-[-0.02em]">
                {model.title}
              </p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{model.description}</p>
            </div>
          ))}
        </div>

        <h3 className="mt-20 text-2xl font-normal uppercase tracking-[-0.04em]">{t("work.processTitle")}</h3>
        <div className="card mt-8 p-0">
          <div className="divide-y divide-border">
            {PROCESS_STEPS.map((step) => (
              <div
                key={step.step}
                className="grid items-start gap-4 p-7 md:grid-cols-[80px_200px_1fr] md:gap-0"
              >
                <span className="text-2xl font-normal tabular-nums text-muted-foreground">
                  {step.step}
                </span>
                <div>
                  <p className="text-base font-semibold uppercase tracking-[-0.02em]">
                    {step.title}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    {step.duration}
                  </p>
                </div>
                <p className="text-sm leading-7 text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
