"use client";

import { useTranslations } from "@/i18n/client";

export function PageFooter() {
  const t = useTranslations("Footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 py-10">
      <div className="container flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <p className="text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground/60">
          {t("rights", { year })}
        </p>
        <p className="text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground/40">
          {t("tagline")}
        </p>
      </div>
    </footer>
  );
}
