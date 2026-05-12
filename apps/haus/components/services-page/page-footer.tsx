"use client";

import { useTranslations } from "next-intl";

export function PageFooter() {
  const t = useTranslations("Footer");

  return (
    <footer className="border-t border-border bg-background py-12">
      <div className="container">
        <p className="text-sm uppercase tracking-widest text-muted-foreground">
          {t("rights", { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}
