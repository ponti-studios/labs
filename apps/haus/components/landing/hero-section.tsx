"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { TerminalTitle } from "@pontistudios/ui";
import { MagneticButton } from "../ui/magnetic-button";
import { ParticleBackground } from "./particle-background";

interface HeroSectionProps {
  title: string;
  description: string;
  cta: string;
  ctaSecondary: string;
  aboutLabel: string;
  aboutTitle: string;
  aboutDescription: string;
  aboutAntiposition?: string;
}

export function HeroSection({
  title,
  description,
  cta,
  ctaSecondary,
  aboutLabel,
  aboutTitle,
  aboutDescription,
  aboutAntiposition,
}: HeroSectionProps) {
  return (
    <section className="relative flex min-h-screen flex-col items-start justify-center overflow-hidden pt-16">
      <ParticleBackground />

      <div className="container relative z-10 py-24 md:py-32">
        <div className="max-w-5xl space-y-12">
          {/* Terminal title — already has its own animation */}
          <TerminalTitle title={title} />

          {/* Description */}
          <p
            className="ui-fade-in-up max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg md:leading-8"
            style={
              {
                "--ui-animate-delay": "300ms",
                "--ui-animate-duration": "600ms",
              } as CSSProperties
            }
          >
            {description}
          </p>

          {/* CTAs */}
          <div
            className="ui-fade-in-up flex flex-wrap items-center gap-4"
            style={
              {
                "--ui-animate-delay": "520ms",
                "--ui-animate-duration": "500ms",
              } as CSSProperties
            }
          >
            <MagneticButton>
              <Link
                href="#contact"
                className="inline-block bg-foreground px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-background transition-opacity hover:opacity-85"
              >
                {cta}
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link
                href="#work"
                className="inline-block border border-foreground/60 px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-foreground/80 transition-colors hover:border-foreground hover:text-foreground"
              >
                {ctaSecondary}
              </Link>
            </MagneticButton>
          </div>

          <div
            className="ui-fade-in-up mt-6 grid gap-8 border-t border-border/60 pt-8 md:mt-10 md:grid-cols-[1fr_1fr]"
            style={
              {
                "--ui-animate-delay": "680ms",
                "--ui-animate-duration": "600ms",
              } as CSSProperties
            }
          >
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {aboutLabel}
              </span>
              <h2 className="mt-3 text-2xl font-normal uppercase tracking-[-0.04em] md:text-3xl">
                {aboutTitle}
              </h2>
            </div>

            <div className="space-y-4">
              <p className="text-base leading-8 text-muted-foreground">{aboutDescription}</p>
              {aboutAntiposition && (
                <p className="border-l-2 border-foreground pl-4 text-sm leading-7 font-medium text-foreground">
                  {aboutAntiposition}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="ui-fade-in-up absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
        style={{ "--ui-animate-delay": "900ms", "--ui-animate-duration": "600ms" } as CSSProperties}
        aria-hidden="true"
      >
        <span className="text-[0.6rem] uppercase tracking-[0.28em] text-muted-foreground/40">
          Scroll
        </span>
        <div className="h-8 w-px bg-gradient-to-b from-muted-foreground/40 to-transparent" />
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
