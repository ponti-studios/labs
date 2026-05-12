"use client";

import { useState } from "react";
import { AccordionRow } from "../landing/ui/accordion-row";
import type { Service } from "./types";

function ItemCount({ count }: { count: number }) {
  return (
    <span className="rounded-full border border-border px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
      {count}
    </span>
  );
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
  const rows = [
    ...service.features.map((f) => f.category),
    ...(service.differentiators ? [labels.differentiators] : []),
    ...(service.process ? [labels.process] : []),
  ];

  const [openRow, setOpenRow] = useState<string | null>(rows[0] ?? null);

  const toggle = (key: string) => setOpenRow((prev) => (prev === key ? null : key));

  return (
    <section
      id={service.id}
      className={`border-b border-border ${index % 2 === 0 ? "bg-background" : "bg-muted"}`}
    >
      <div className="container py-20 md:py-28">
        <div className="flex gap-8">
          <div>
            <h2 className="section-heading">{service.title}</h2>
            <p className="self-end text-base leading-8 text-muted-foreground">
              {service.description}
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-border">
          {service.features.map((feature, i) => (
            <AccordionRow
              key={feature.category}
              index={i}
              isOpen={openRow === feature.category}
              onToggleAction={() => toggle(feature.category)}
              title={feature.category}
              badge={<ItemCount count={feature.items.length} />}
            >
              <ul className="space-y-2">
                {feature.items.map((item) => (
                  <li key={item} className="dash-list-item">
                    <span className="dash">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </AccordionRow>
          ))}

          {service.differentiators && (
            <AccordionRow
              index={service.features.length}
              isOpen={openRow === labels.differentiators}
              onToggleAction={() => toggle(labels.differentiators)}
              title={labels.differentiators}
              badge={<ItemCount count={service.differentiators.length} />}
            >
              <ul className="space-y-2">
                {service.differentiators.map((item) => (
                  <li key={item} className="dash-list-item">
                    <span className="dash">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </AccordionRow>
          )}

          {service.process && (
            <AccordionRow
              index={service.features.length + (service.differentiators ? 1 : 0)}
              isOpen={openRow === labels.process}
              onToggleAction={() => toggle(labels.process)}
              title={labels.process}
              badge={<ItemCount count={service.process.length} />}
              aside={
                <span className="hidden text-xs text-muted-foreground md:block">
                  {service.process.length} steps
                </span>
              }
            >
              <ol className="space-y-2">
                {service.process.map((step, idx) => (
                  <li key={step} className="dash-list-item">
                    <span className="shrink-0 tabular-nums text-muted-foreground">{idx + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </AccordionRow>
          )}
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="card">
            <p className="mb-5 eyebrow">{labels.engagement}</p>
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
          </div>

          <div className="card">
            <p className="mb-5 eyebrow">{labels.perfectFor}</p>
            <ul className="space-y-2">
              {service.perfectFor.map((item) => (
                <li key={item} className="dash-list-item">
                  <span className="dash">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
