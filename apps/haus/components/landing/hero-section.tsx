"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import type { CSSProperties } from "react";
import { MagneticButton } from "../ui/magnetic-button";

interface FeaturedProject {
  name: string;
  kind: string;
  metric: string;
  metricLabel: string;
  blurb: string;
}

interface HeroSectionProps {
  featuredProject?: FeaturedProject;
}

function HeroCardRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-white/[0.08] py-3 first:border-t-0 first:pt-0 last:pb-0">
      <span className="text-[0.65rem] uppercase tracking-[0.24em] text-[#8b8b84]">{label}</span>
      <span className="text-sm uppercase tracking-[0.14em] text-[#f5f5f0]">{value}</span>
    </div>
  );
}

export function HeroSection({ featuredProject }: HeroSectionProps) {
  const t = useTranslations("Studio");
  const eyebrow = t("hero.eyebrow");
  const title = t("hero.title");
  const description = t("hero.description");
  const cta = t("hero.cta");
  const ctaSecondary = t("hero.ctaSecondary");
  const featuredLabel = t("hero.featuredLabel");
  const latestLabel = t("hero.latestLabel");
  const projectLabel = t("hero.cardLabels.project");
  const resultLabel = t("hero.cardLabels.result");
  const focusLabel = t("hero.cardLabels.focus");
  const projects = t.raw("projects.items") as FeaturedProject[];
  const selectedProject = featuredProject ?? projects[2] ?? projects[0];

  return (
    <section className="relative overflow-hidden border-b border-border bg-[#080808] text-[#f5f5f0]">
      <div
        className="absolute inset-0 opacity-100"
        style={{
          background:
            "radial-gradient(circle at 15% 20%, rgba(215,255,100,0.16) 0%, rgba(215,255,100,0.05) 18%, rgba(8,8,8,0) 44%), radial-gradient(circle at 86% 24%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 16%, rgba(8,8,8,0) 42%), linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 30%)",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-[#d7ff64]/[0.08] blur-3xl" />
      <div className="absolute -right-24 top-36 h-80 w-80 rounded-full bg-white/[0.06] blur-3xl" />

      <div className="container relative z-10 py-28 md:py-32 lg:py-36">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-center">
          <div className="space-y-8">
            <div
              className="ui-fade-in-up inline-flex items-center gap-3 border border-white/10 bg-white/[0.03] px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#d7ff64]"
              style={
                {
                  "--ui-animate-delay": "60ms",
                  "--ui-animate-duration": "420ms",
                } as CSSProperties
              }
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#d7ff64]" />
              {eyebrow}
            </div>

            <div
              className="ui-fade-in-up max-w-4xl"
              style={
                {
                  "--ui-animate-delay": "150ms",
                  "--ui-animate-duration": "520ms",
                } as CSSProperties
              }
            >
              <h1 className="text-balance text-[clamp(3.15rem,8vw,7rem)] font-medium leading-[0.9] tracking-[-0.08em] text-[#f7f7f2]">
                {title}
              </h1>
            </div>

            <div
              className="ui-fade-in-up max-w-2xl space-y-6"
              style={
                {
                  "--ui-animate-delay": "250ms",
                  "--ui-animate-duration": "500ms",
                } as CSSProperties
              }
            >
              <p className="text-base leading-8 text-[#b6b6af] md:text-lg">{description}</p>

              <div className="flex flex-wrap gap-3">
                <MagneticButton className="inline-flex">
                  <Link
                    href="#contact"
                    className="inline-flex items-center justify-center bg-[#f5f5f0] px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#080808] transition-transform duration-200 hover:-translate-y-0.5"
                  >
                    {cta}
                  </Link>
                </MagneticButton>
                <MagneticButton className="inline-flex">
                  <Link
                    href="#projects"
                    className="inline-flex items-center justify-center border border-white/[0.14] bg-white/[0.02] px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#f5f5f0] transition-colors duration-200 hover:border-white/[0.25] hover:bg-white/[0.06]"
                  >
                    {ctaSecondary}
                  </Link>
                </MagneticButton>
              </div>

              <p className="max-w-xl text-[0.68rem] uppercase tracking-[0.24em] text-[#7f7f79]">
                Strategy, design, engineering, and AI systems for teams shipping real products.
              </p>
            </div>
          </div>

          <div
            className="ui-fade-in-up"
            style={
              {
                "--ui-animate-delay": "300ms",
                "--ui-animate-duration": "560ms",
              } as CSSProperties
            }
          >
            <div className="relative overflow-hidden border border-white/10 bg-white/[0.03] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] md:p-7">
              <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#d7ff64]/[0.1] blur-3xl" />
              <div className="absolute -bottom-16 left-10 h-36 w-36 rounded-full bg-white/[0.06] blur-3xl" />

              <div className="relative space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[0.65rem] uppercase tracking-[0.28em] text-[#8b8b84]">
                    {featuredLabel}
                  </span>
                  <span className="text-[0.65rem] uppercase tracking-[0.28em] text-[#d7ff64]">
                    {latestLabel}
                  </span>
                </div>

                <div className="space-y-4 border-b border-white/10 pb-6">
                  <p className="text-sm uppercase tracking-[0.18em] text-[#9c9c95]">
                    {selectedProject.kind}
                  </p>
                  <p className="text-[clamp(2.3rem,5vw,4.2rem)] font-medium leading-none tracking-[-0.08em] text-[#f7f7f2]">
                    {selectedProject.metric}
                  </p>
                  <p className="max-w-sm text-sm leading-7 text-[#b6b6af]">
                    {selectedProject.blurb}
                  </p>
                </div>

                <div className="grid gap-0.5">
                  <HeroCardRow label={projectLabel} value={selectedProject.name} />
                  <HeroCardRow
                    label={resultLabel}
                    value={`${selectedProject.metric} ${selectedProject.metricLabel}`}
                  />
                  <HeroCardRow label={focusLabel} value={selectedProject.kind} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
