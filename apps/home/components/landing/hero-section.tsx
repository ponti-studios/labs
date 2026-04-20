"use client";

import Link from "next/link";

interface HeroSectionProps {
  title: string;
  description: string;
  cta: string;
  ctaSecondary: string;
}

export function HeroSection({ title, description, cta, ctaSecondary }: HeroSectionProps) {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-20">
      <div className="absolute inset-0 opacity-[0.15] bg-[repeating-linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),repeating-linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-size-[56px_56px]" />
      <div className="container relative z-10 py-20 md:py-28">
        <div className="max-w-4xl space-y-8">
          <h1 className="text-5xl font-normal uppercase tracking-[-0.04em] leading-[0.92]">
            {title}
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">{description}</p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="#contact"
              className="rounded-none bg-foreground px-6 py-3 text-sm font-semibold uppercase tracking-wider text-background hover:opacity-90"
            >
              {cta}
            </Link>
            <Link
              href="#work"
              className="rounded-none border border-foreground px-6 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors"
            >
              {ctaSecondary}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
