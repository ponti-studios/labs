import type { CSSProperties } from "react";

import { TiltCard, type TiltCardGlow } from "~/components/TiltCard";

import { SPECIMEN_THEMES, type SpecimenCategory } from "./specimen-themes";

export type SpecimenProject = {
  id: string;
  href: string;
  logo?: string;
  logoAlt: string;
  title: string;
  category: SpecimenCategory;
  /** Badge text — defaults to `category`. Lets playground items carry their own
   * classification (e.g. "Simulation") while still using the "experiment" finish. */
  label?: string;
  /** Rendered as the rotated corner stamp, e.g. "Active", "Development". */
  status: string;
  /** Up to three shown; the rest are dropped, not truncated mid-word. */
  tech?: string[];
};

// Deterministic per-slug accession number so the same project always files
// under the same number — same idea as project-card's seeded PAN, sized for
// a 3-digit call number instead of a 16-digit one.
function seededSerial(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return String((hash % 899) + 100);
}

export function SpecimenCard({
  href,
  logo,
  logoAlt,
  title,
  category,
  label,
  status,
  tech = [],
  ...rest
}: SpecimenProject & { "data-testid"?: string }) {
  const theme = SPECIMEN_THEMES[category];
  const serial = seededSerial(title);

  const cardStyle = {
    background: theme.background,
    "--card-fg": theme.foreground,
    "--card-accent": theme.accent,
  } as CSSProperties;

  const glow: TiltCardGlow = {
    radiusPx: 280,
    color: theme.accent,
    opacityPercent: 20,
    fadeEndPercent: 65,
  };

  return (
    <TiltCard
      to={href}
      prefetch="intent"
      glow={glow}
      style={{
        ...cardStyle,
        borderColor: "color-mix(in oklab, var(--card-accent) 30%, transparent)",
      }}
      className="flex aspect-[1.586/1] w-[300px] shrink-0 snap-start flex-col rounded-lg border p-4 text-[var(--card-fg)] shadow-lg shadow-black/10 transition-shadow duration-200 hover:shadow-black/25 sm:w-[340px] sm:p-5"
      {...rest}
    >
      {/* Inset rule, like the printed border on an index card */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-2 rounded-md border border-dashed opacity-30"
        style={{ borderColor: "var(--card-fg)" }}
      />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold tracking-wide uppercase"
          style={{
            backgroundColor: "color-mix(in oklab, var(--card-accent) 18%, transparent)",
            color: "var(--card-accent)",
          }}
        >
          <span
            className="size-1.5 rounded-full"
            style={{ backgroundColor: "var(--card-accent)" }}
          />
          {label ?? category}
        </span>
        <span
          className="font-serif text-sm tracking-tight italic opacity-70"
          style={{ color: "var(--card-fg)" }}
        >
          # {serial}
        </span>
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-2 text-center">
        {logo ? (
          <img
            src={logo}
            alt={logoAlt}
            className="size-7 w-auto rounded object-contain opacity-80 mix-blend-luminosity"
          />
        ) : (
          <span
            aria-hidden="true"
            className="size-2.5 rounded-full border"
            style={{ borderColor: "var(--card-fg)", opacity: 0.4 }}
          />
        )}
        <span className="text-base font-semibold tracking-[0.02em]">{title}</span>
      </div>

      <div className="relative z-10 mt-auto flex items-end justify-between gap-3">
        {tech.length > 0 ? (
          <p
            className="truncate font-mono text-[10px] tracking-wide opacity-60"
            style={{ color: "var(--card-fg)" }}
          >
            {tech.slice(0, 3).join(" · ")}
          </p>
        ) : (
          <span />
        )}
        <span
          aria-hidden="true"
          className="-rotate-6 rounded-sm border-2 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.15em] uppercase"
          style={{
            borderColor: "var(--card-accent)",
            color: "var(--card-accent)",
          }}
        >
          {status}
        </span>
      </div>

      <span aria-hidden="true" className="card-shine" />
    </TiltCard>
  );
}
