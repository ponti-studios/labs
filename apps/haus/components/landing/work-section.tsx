"use client";

import { useState } from "react";
import { AccordionRow, SectionHeader } from "./shared";

// ─── Data shapes ─────────────────────────────────────────────────────────────

interface ClientItem {
  name: string;
  type: string;
  metric: string;
  metricLabel: string;
  blurb: string;
}

interface VentureItem {
  name: string;
  description: string;
  status: string;
}

export interface WorkSectionProps {
  label: string;
  title: string;
  subtitle: string;
  clients: ClientItem[];
  venturesLabel: string;
  venturesTitle: string;
  venturesSubtitle: string;
  ventures: VentureItem[];
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function WorkSection({
  label,
  title,
  subtitle,
  clients,
  venturesLabel,
  venturesTitle,
  venturesSubtitle,
  ventures,
}: WorkSectionProps) {
  const [openClient, setOpenClient] = useState<number | null>(null);
  const [openVenture, setOpenVenture] = useState<number | null>(null);

  const toggleClient = (i: number) => setOpenClient(openClient === i ? null : i);
  const toggleVenture = (i: number) => setOpenVenture(openVenture === i ? null : i);

  return (
    <section id="work" className="border-t border-border bg-background">
      <div className="container py-20 md:py-28">

        {/* ── Section header ── */}
        <div className="mb-16">
          <SectionHeader label={label} title={title} subtitle={subtitle} />
        </div>

        {/* ── Case studies ── */}
        <div className="mt-16">
          <div className="mb-8">
            <SectionHeader
              as="h3"
              label="Case Studies"
              title="Client work"
              headingClassName="mt-2 text-2xl"
            />
          </div>
          <div>
            {clients.map((client, i) => (
              <AccordionRow
                key={client.name}
                index={i}
                isOpen={openClient === i}
                onToggle={() => toggleClient(i)}
                title={client.name}
                badge={
                  <span className="hidden text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground/50 sm:block">
                    {client.type}
                  </span>
                }
                aside={
                  <span className="hidden text-right md:block">
                    <span className="block text-lg font-normal tracking-tight tabular-nums">
                      {client.metric}
                    </span>
                    <span className="block text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground/50">
                      {client.metricLabel}
                    </span>
                  </span>
                }
              >
                {/* Metric visible on mobile inside expanded content */}
                <p className="mb-1 text-sm font-medium tabular-nums md:hidden">
                  {client.metric}{" "}
                  <span className="text-xs font-normal uppercase tracking-[0.16em] text-muted-foreground">
                    {client.metricLabel}
                  </span>
                </p>
                <p className="text-sm leading-7 text-muted-foreground max-w-2xl">{client.blurb}</p>
              </AccordionRow>
            ))}
          </div>
        </div>

        {/* ── Ventures ── */}
        <div className="mt-16 border-t border-border pt-16">
          <div className="mb-8">
            <SectionHeader
              as="h3"
              label={venturesLabel}
              title={venturesTitle}
              subtitle={venturesSubtitle}
              headingClassName="mt-2 text-2xl"
            />
          </div>
          <div>
            {ventures.map((venture, i) => (
              <AccordionRow
                key={venture.name}
                index={i}
                isOpen={openVenture === i}
                onToggle={() => toggleVenture(i)}
                title={venture.name}
                aside={
                  <span className="hidden items-center gap-1.5 sm:inline-flex">
                    <span className="h-1.5 w-1.5 rounded-full bg-foreground/30" />
                    <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground/50">
                      {venture.status}
                    </span>
                  </span>
                }
              >
                <p className="text-sm leading-7 text-muted-foreground max-w-2xl">
                  {venture.description}
                </p>
              </AccordionRow>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
