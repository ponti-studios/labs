"use client";

import { useTranslations } from "@/i18n/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@pontistudios/ui";
import { useState } from "react";

interface ProjectItem {
  name: string;
  kind: string;
  metric: string;
  metricLabel: string;
  blurb: string;
}

export function ProjectsSection() {
  const t = useTranslations("Studio");
  const label = t("projects.label");
  const title = t("projects.title");
  const subtitle = t("projects.subtitle");
  const projects = t.raw<ProjectItem[]>("projects.items");
  const [openProject, setOpenProject] = useState<string | null>(null);

  return (
    <section id="projects" className="border-t border-border">
      <div className="container py-20 md:py-28">
        <div className="mb-16 grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <span className="eyebrow">{label}</span>
            <h2 className="section-heading">{title}</h2>
          </div>
          <div className="flex items-end">
            <p className="text-sm leading-7 text-muted-foreground">{subtitle}</p>
          </div>
        </div>

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
          <Accordion
            type="single"
            collapsible
            value={openProject ?? undefined}
            onValueChange={(value) => setOpenProject(value || null)}
          >
            {projects.map((project, index) => {
              const value = `project-${index}`;

              return (
                <AccordionItem key={project.name} value={value}>
                  <AccordionTrigger
                    index={index}
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
                    {project.name}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-1 text-sm font-medium tabular-nums md:hidden">
                      {project.metric}{" "}
                      <span className="text-xs font-normal uppercase tracking-[0.16em] text-muted-foreground">
                        {project.metricLabel}
                      </span>
                    </p>
                    <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                      {project.blurb}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
