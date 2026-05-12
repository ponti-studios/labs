"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@pontistudios/ui";
import { StatsStrip } from "./stats-strip";

export function HeroSection() {
  const t = useTranslations("Studio");
  const title = t("hero.title");
  const description = t("hero.description");
  const cta = t("hero.cta");
  const ctaSecondary = t("hero.ctaSecondary");

  return (
    <section className="relative overflow-hidden border-b border-border bg-[#080808] text-[#f5f5f0]">
      <div className="container relative z-10 py-28 md:py-32 lg:py-36">
        <div className="space-y-8">
          <div className="ui-fade-in-up max-w-4xl">
            <h1 className="text-balance text-[clamp(3.15rem,8vw,7rem)] font-medium leading-[0.9] tracking-[-0.08em] text-[#f7f7f2]">
              {title}
            </h1>
          </div>

          <div className="ui-fade-in-up max-w-2xl space-y-6">
            <p className="text-base leading-8 text-[#b6b6af] md:text-lg">{description}</p>

            <div className="flex flex-wrap gap-3">
              <Button variant="secondary">
                <Link href="#contact">{cta}</Link>
              </Button>
              <Button variant="destructive">
                <Link href="#projects">{ctaSecondary}</Link>
              </Button>
            </div>
          </div>

          <StatsStrip />
        </div>
      </div>
    </section>
  );
}
