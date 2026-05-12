"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router";
import { useState } from "react";
import { useTranslations } from "@/i18n/client";
import { SERVICES } from "../services-page/data";

const NAV_HEIGHT = 73;

export function SiteNavigation() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("Navigation");

  const close = () => setOpen(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container flex items-center justify-between py-4">
          <Link to="/" className="group flex items-center gap-3" onClick={close}>
            <span className="text-lg font-bold uppercase tracking-tight">{t("home")}</span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium md:flex">
            <Link to="/#services" className="transition-opacity hover:opacity-60">
              {t("services")}
            </Link>
            <Link to="/#projects" className="transition-opacity hover:opacity-60">
              {t("projects")}
            </Link>
            <Link to="/#principles" className="transition-opacity hover:opacity-60">
              {t("principles")}
            </Link>
            <Link
              to="/#contact"
              className="rounded-none border border-foreground px-4 py-2 uppercase tracking-wider transition-colors hover:bg-foreground hover:text-background"
            >
              {t("contact")}
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center text-foreground md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <motion.span
              animate={{ rotate: open ? 45 : 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="text-2xl leading-none"
            >
              {open ? "✕" : "≡"}
            </motion.span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ top: NAV_HEIGHT }}
            className="fixed inset-x-0 bottom-0 z-40 overflow-y-auto border-b border-border bg-background md:hidden"
          >
            <div className="container py-8">
              <div className="flex flex-col gap-3">
                {[
                  { href: "/#services", label: t("services") },
                  { href: "/#projects", label: t("projects") },
                  { href: "/#principles", label: t("principles") },
                  { href: "/#contact", label: t("contact") },
                ].map(({ href, label }) => (
                  <Link
                    key={href}
                    to={href}
                    onClick={close}
                    className="text-sm font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </Link>
                ))}
              </div>

              <div className="my-6 border-t border-border" />

              <p className="eyebrow mb-4">Services</p>
              <div className="flex flex-col gap-3">
                {SERVICES.map((service) => (
                  <a
                    key={service.id}
                    href={`/services#${service.id}`}
                    onClick={close}
                    className="text-sm uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {service.title}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
