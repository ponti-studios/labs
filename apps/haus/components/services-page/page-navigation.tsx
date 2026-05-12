"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function PageNavigation() {
  const t = useTranslations("ServicesPage");
  const nav = useTranslations("Navigation");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 grid-cols-3 grid-rows-3 gap-0.5">
            <div className="bg-foreground" />
            <div className="col-span-2 bg-foreground" />
            <div className="bg-transparent" />
            <div className="bg-foreground" />
            <div className="bg-foreground" />
            <div className="col-span-2 bg-foreground" />
            <div className="bg-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight uppercase">{nav("home")}</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium md:flex">
          <Link href="/#services" className="transition-opacity hover:opacity-60">
            {t("nav.services")}
          </Link>
          <Link href="/#projects" className="transition-opacity hover:opacity-60">
            {t("nav.projects")}
          </Link>
          <Link href="/#principles" className="transition-opacity hover:opacity-60">
            {t("nav.principles")}
          </Link>
          <Link
            href="/#contact"
            className="rounded-none border border-foreground px-4 py-2 uppercase tracking-wider transition-colors hover:bg-foreground hover:text-background"
          >
            {nav("contact")}
          </Link>
        </div>
      </div>
    </nav>
  );
}
