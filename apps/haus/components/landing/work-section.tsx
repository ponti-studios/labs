"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { AccordionRow, SectionHeader } from "./shared";

// ─── Data shapes ─────────────────────────────────────────────────────────────

interface ProjectItem {
  name: string;
  kind: string;
  metric: string;
  metricLabel: string;
  blurb: string;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function ProjectsSection() {
  const t = useTranslations("Studio");
  const label = t("projects.label");
  const title = t("projects.title");
  const subtitle = t("projects.subtitle");
  const projects = t.raw("projects.items") as ProjectItem[];
  const [openProject, setOpenProject] = useState<number | null>(null);

  return (
    <section id="projects" className="border-t border-border bg-background">
      <div className="container py-20 md:py-28">

        {/* ── Section header ── */}
        <div className="mb-16">
          <SectionHeader label={label} title={title} subtitle={subtitle} />
        </div>

        {/* ── Projects table ── */}
        <div className="mt-16">
          <div className="hidden border-b border-border px-6 pb-3 md:grid md:grid-cols-[minmax(0,1fr)_auto_auto_auto] md:items-end">
            <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground/50">
              Project
            </span>
            <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground/50">
              Type
            </span>
            <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground/50">
              Result
            </span>
            <span />
          </div>
          <div>
            {projects.map((project, i) => (
              <AccordionRow
                key={project.name}
                index={i}
                isOpen={openProject === i}
                onToggle={() => setOpenProject(openProject === i ? null : i)}
                title={project.name}
                badge={
                  <span className="hidden text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground/50 sm:block">
                    {project.kind}
                  </span>
                }
                aside={
                  <span className="hidden text-right md:block">
                    <span className="block text-lg font-normal tracking-tight tabular-nums">
                      {project.metric}
                    </span>
                    <span className="block text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground/50">
                      {project.metricLabel}
                    </span>
                  </span>
                }
              >
                {/* Metric visible on mobile inside expanded content */}
                <p className="mb-1 text-sm font-medium tabular-nums md:hidden">
                  {project.metric}{" "}
                  <span className="text-xs font-normal uppercase tracking-[0.16em] text-muted-foreground">
                    {project.metricLabel}
                  </span>
                </p>
                <p className="max-w-2xl text-sm leading-7 text-muted-foreground">{project.blurb}</p>
              </AccordionRow>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
