"use client";

import { ReactNode } from "react";
import type { Service } from "./types";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`border border-border bg-background p-7 ${className}`}>{children}</div>;
}

export function ServiceSection({
  service,
  index,
  labels,
}: {
  service: Service;
  index: number;
  labels: {
    differentiators: string;
    process: string;
    engagement: string;
    duration: string;
    team: string;
    delivery: string;
    investment: string;
    perfectFor: string;
  };
}) {
  return (
    <section
      id={service.id}
      className={`border-b border-border ${index % 2 === 0 ? "bg-background" : "bg-muted"}`}
    >
      <div className="container py-20 md:py-28">
        <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              0{index + 1}
            </span>
            <h2 className="mt-3 text-3xl font-normal uppercase tracking-[-0.04em]">
              {service.title}
            </h2>
            <p className="mt-2 text-sm italic text-muted-foreground">{service.subtitle}</p>
          </div>
          <p className="self-end text-base leading-8 text-muted-foreground">
            {service.description}
          </p>
        </div>

        <div
          className={`mt-12 grid gap-5 ${
            service.features.length > 1 ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2"
          }`}
        >
          {service.features.map((feature) => (
            <Card key={feature.category}>
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {feature.category}
              </p>
              <ul className="space-y-2">
                {feature.items.map((item) => (
                  <li key={item} className="flex gap-2 text-sm leading-6 text-foreground">
                    <span className="shrink-0 mt-0.5 text-muted-foreground">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}

          {service.differentiators && (
            <Card>
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {labels.differentiators}
              </p>
              <ul className="space-y-2">
                {service.differentiators.map((item) => (
                  <li key={item} className="flex gap-2 text-sm leading-6 text-foreground">
                    <span className="shrink-0 mt-0.5 text-muted-foreground">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {service.process && (
            <Card>
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {labels.process}
              </p>
              <ol className="space-y-2">
                {service.process.map((step, idx) => (
                  <li key={step} className="flex gap-2 text-sm leading-6 text-foreground">
                    <span className="shrink-0 tabular-nums text-muted-foreground">{idx + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </Card>
          )}
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Card>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {labels.engagement}
            </p>
            <dl className="space-y-3">
              <div className="flex gap-4">
                <dt className="w-24 shrink-0 pt-0.5 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {labels.duration}
                </dt>
                <dd className="text-sm text-foreground">{service.engagement.duration}</dd>
              </div>
              <div className="flex gap-4">
                <dt className="w-24 shrink-0 pt-0.5 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {labels.team}
                </dt>
                <dd className="text-sm text-foreground">{service.engagement.team}</dd>
              </div>
              <div className="flex gap-4">
                <dt className="w-24 shrink-0 pt-0.5 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {labels.delivery}
                </dt>
                <dd className="text-sm text-foreground">{service.engagement.delivery}</dd>
              </div>
              <div className="mt-3 flex gap-4 border-t border-border pt-3">
                <dt className="w-24 shrink-0 pt-0.5 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {labels.investment}
                </dt>
                <dd className="text-sm font-semibold text-foreground">
                  {service.engagement.investment}
                </dd>
              </div>
            </dl>
          </Card>

          <Card>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {labels.perfectFor}
            </p>
            <ul className="space-y-2">
              {service.perfectFor.map((item) => (
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
