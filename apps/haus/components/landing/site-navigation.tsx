"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function SiteNavigation() {
  const t = useTranslations("Navigation");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-md">
      <div className="container flex items-center justify-between py-3.5">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="grid h-7 w-7 grid-cols-3 grid-rows-3 gap-[2px] transition-opacity group-hover:opacity-70">
            <div className="bg-foreground" />
            <div className="col-span-2 bg-foreground" />
            <div className="bg-transparent" />
            <div className="bg-foreground" />
            <div className="bg-foreground" />
            <div className="col-span-2 bg-foreground" />
            <div className="bg-foreground" />
          </div>
          <span className="text-sm font-semibold tracking-[0.12em] uppercase">
            {t("home")}
          </span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {(["Services", "Projects", "Principles"] as const).map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {item}
            </Link>
          ))}
          <Link
            href="#contact"
            className="border border-foreground/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors hover:bg-foreground hover:text-background"
          >
            {t("contact")}
          </Link>
        </div>
      </div>
    </nav>
  );
}
