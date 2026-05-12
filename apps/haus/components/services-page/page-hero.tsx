"use client";

import { useTranslations } from "@/i18n/client";

export function PageHero() {
  const t = useTranslations("ServicesPage");

  return (
    <section className="border-b border-border pt-32 pb-20 md:pb-28">
      <div className="container">
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          {t("hero.eyebrow")}
        </span>
        <h1 className="mt-3 max-w-3xl text-4xl font-normal uppercase tracking-[-0.04em] md:text-5xl lg:text-6xl">
          {t("hero.title")}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground">
          {t("hero.description")}
        </p>
        <p className="mt-4 max-w-xl border-l-2 border-foreground pl-4 text-sm leading-7 text-muted-foreground">
          {t("hero.antiposition")}
        </p>
      </div>
    </section>
  );
}
