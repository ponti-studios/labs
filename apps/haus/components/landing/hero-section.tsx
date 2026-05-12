"use client";

import { useTranslations } from "@/i18n/client";
import { Button } from "@pontistudios/ui";
import { Link } from "react-router";

export function HeroSection() {
  const studio = useTranslations("Studio");
  const services = useTranslations("ServicesPage");

  return (
    <section className="border-b border-border text-foreground">
      <div className="container py-28 md:py-32 lg:py-36">
        <div className="space-y-8">
          <div className="ui-fade-in-up max-w-4xl">
            <h1 className="text-balance text-[clamp(3.15rem,8vw,7rem)] font-medium leading-[0.9] tracking-[-0.08em] text-foreground">
              {studio("hero.title")}
            </h1>
          </div>

          <div className="ui-fade-in-up max-w-2xl space-y-6">
            <p className="text-base leading-8 text-muted-foreground md:text-lg">
              {studio("hero.description")}
            </p>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="default">
                <Link to="/#contact">{studio("hero.cta")}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/#projects">{studio("hero.ctaSecondary")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div id="services" className="scroll-mt-24 border-t border-border bg-muted/30">
        <div className="container py-20 md:py-28">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {services("hero.eyebrow")}
          </span>
          <h2 className="mt-3 max-w-3xl text-4xl font-normal uppercase tracking-[-0.04em] md:text-5xl lg:text-6xl">
            {services("hero.title")}
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground">
            {services("hero.description")}
          </p>
          <p className="mt-4 max-w-xl border-l-2 border-foreground pl-4 text-sm leading-7 text-muted-foreground">
            {services("hero.antiposition")}
          </p>
        </div>
      </div>
    </section>
  );
}
