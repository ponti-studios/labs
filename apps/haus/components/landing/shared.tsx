"use client";

/**
 * Shared landing primitives.
 *
 * Every section imports from here. Change a style once → trickles everywhere.
 *
 *   SectionLabel     — eyebrow text ("Services", "Selected work", …)
 *   SectionHeading   — h2 / h3 with the site's display type treatment
 *   SectionHeader    — label + heading, optionally 2-col when subtitle provided
 *   RowToggle        — animated + → × for accordion rows
 *   AccordionRow     — numbered expand / collapse row (Services, Projects, Principles)
 */

import { AnimatePresence, motion, useInView } from "framer-motion";
import { useRef } from "react";

// ─── Typography ───────────────────────────────────────────────────────────────

/** Eyebrow label above a section heading. */
export function SectionLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground ${className}`}
    >
      {children}
    </span>
  );
}

/** Primary display heading. Defaults to h2; pass as="h3" for subsections. */
export function SectionHeading({
  children,
  as: Tag = "h2",
  className = "",
}: {
  children: React.ReactNode;
  as?: "h2" | "h3";
  className?: string;
}) {
  return (
    <Tag
      className={`font-normal uppercase tracking-[-0.04em] ${className}`}
    >
      {children}
    </Tag>
  );
}

/**
 * Section header: label + heading stacked.
 * When `subtitle` is provided the layout becomes two columns (heading left,
 * subtitle right) — matching the Services / Projects header pattern.
 */
export function SectionHeader({
  label,
  title,
  subtitle,
  as = "h2",
  headingClassName = "mt-3 text-3xl",
}: {
  label: string;
  title: string;
  subtitle?: string;
  as?: "h2" | "h3";
  headingClassName?: string;
}) {
  if (subtitle) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div>
          <SectionLabel>{label}</SectionLabel>
          <SectionHeading as={as} className={headingClassName}>
            {title}
          </SectionHeading>
        </div>
        <div className="flex items-end">
          <p className="text-sm leading-7 text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <SectionHeading as={as} className={headingClassName}>
        {title}
      </SectionHeading>
    </div>
  );
}

// ─── Accordion ────────────────────────────────────────────────────────────────

/** Animated + → × toggle used in every accordion row. */
export function RowToggle({ open }: { open: boolean }) {
  return (
    <motion.span
      animate={{ rotate: open ? 45 : 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="shrink-0 text-xl leading-none text-muted-foreground/50 transition-colors group-hover:text-muted-foreground"
    >
      +
    </motion.span>
  );
}

/**
 * Numbered expand / collapse row.
 *
 * @param title   — primary label shown in the row header (always visible)
 * @param badge   — optional slot after title (e.g. type tag); rendered in the
 *                  left group alongside the title
 * @param aside   — optional slot before the toggle (e.g. metric, status pill)
 * @param children — content revealed on expand; rendered with pl-14 indent
 */
export function AccordionRow({
  index,
  isOpen,
  onToggle,
  title,
  badge,
  aside,
  children,
}: {
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  title: string;
  badge?: React.ReactNode;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-5%" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="border-b border-border last:border-b-0"
    >
      <button
        type="button"
        onClick={onToggle}
        className="group flex w-full items-center justify-between py-5 text-left"
      >
        {/* Left cluster: index + title + optional badge */}
        <div className="flex min-w-0 items-center gap-6 md:gap-8">
          <span className="w-6 shrink-0 text-xs tabular-nums text-muted-foreground/50 transition-colors group-hover:text-muted-foreground">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span
            className={`text-base uppercase tracking-[-0.02em] transition-colors duration-200 ${
              isOpen ? "text-foreground" : "text-foreground/70 group-hover:text-foreground"
            }`}
          >
            {title}
          </span>
          {badge}
        </div>

        {/* Right cluster: optional aside + toggle */}
        <div className="flex shrink-0 items-center gap-5 md:gap-8">
          {aside}
          <RowToggle open={isOpen} />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-6 pl-14">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
