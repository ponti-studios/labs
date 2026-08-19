import { LucideArrowBigRight } from "lucide-react";
import { type CSSProperties, type ReactNode } from "react";

import { TiltCard, type TiltCardGlow } from "~/components/TiltCard";
import { cn } from "~/lib/utils";

import { CARD_THEMES, type CardThemeName } from "./card-themes";

export type FeaturedProject = {
  id: string;
  href: string;
  isExternal?: boolean;
  logo: string;
  logoAlt: string;
  title: string;
  description: string;
  cta: string;
  theme: CardThemeName;
  /** e.g. "Live" — rendered as a chip-position status pill. Omitted if not provided. */
  status?: string;
  /** Custom center-band content (e.g. a game preview). Falls back to a fake embossed card number. */
  preview?: ReactNode;
};

// Deterministic per-card "PAN" so the fallback preview reads like an
// embossed card number instead of a placeholder — same seed always
// produces the same digits, so server and client render match.
function seededCardDigits(seed: string, length: number): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  let digits = "";
  for (let i = 0; i < length; i++) {
    hash = (hash * 1103515245 + 12345) >>> 0;
    digits += hash % 10;
  }
  return digits;
}

function formatCardNumber(seed: string): string {
  return seededCardDigits(seed, 16)
    .match(/.{1,4}/g)!
    .join(" ");
}

function DefaultPreview({ foreground, seed }: { foreground: string; seed: string }) {
  return (
    <span
      aria-hidden="true"
      className="font-mono text-sm tracking-[0.1em] whitespace-nowrap tabular-nums"
      style={{ color: foreground, opacity: 0.75 }}
    >
      {formatCardNumber(seed)}
    </span>
  );
}

export function ProjectCard({
  href,
  isExternal,
  logo,
  logoAlt,
  title,
  description,
  cta,
  theme,
  status,
  preview,
  ...rest
}: FeaturedProject & { "data-testid"?: string }) {
  const themeTokens = CARD_THEMES[theme];

  // `background` (not `background-color`) so gradient themes render — a
  // A Tailwind background-color utility would only ever set background-color.
  // Cast: CSS custom properties aren't in framer-motion's MotionStyle type.
  const cardStyle = {
    background: themeTokens.background,
    "--card-fg": themeTokens.foreground,
    "--card-accent": themeTokens.accent,
  } as CSSProperties;
  const cardClassName =
    "flex aspect-[1.586/1] w-[300px] shrink-0 snap-start flex-col rounded-2xl border border-white/10 p-4 text-[var(--card-fg)] shadow-lg shadow-black/20 transition-shadow duration-200 hover:shadow-black/40 sm:w-[340px] sm:p-5";

  const cardContent = (
    <>
      <div className="relative z-10 flex items-start justify-between">
        <img src={logo} alt={logoAlt} className="size-8 w-auto rounded-md object-contain" />
        {status && (
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
            {status}
          </span>
        )}
      </div>

      <div
        className={cn(
          "relative z-10 flex flex-1",
          preview ? "items-center justify-center" : "items-end justify-start",
        )}
      >
        {preview ?? <DefaultPreview foreground={themeTokens.foreground} seed={title} />}
      </div>

      <div className="relative z-10 mt-auto flex items-end justify-between transition-opacity duration-200 group-hover:opacity-0">
        <span className="text-xs font-semibold tracking-[0.15em] uppercase opacity-90">
          {title}
        </span>
        <LucideArrowBigRight className="size-4 opacity-50" aria-hidden="true" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col gap-1 bg-linear-to-t from-black via-black/85 to-transparent p-4 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 motion-safe:translate-y-2 motion-safe:transition-[opacity,transform] motion-safe:group-hover:translate-y-0 sm:p-5">
        <span className="text-sm font-semibold text-white">{title}</span>
        <p className="text-xs text-white/70">{description}</p>
        <span
          className="mt-1 inline-flex items-center gap-1 text-xs font-semibold"
          style={{ color: "var(--card-accent)" }}
        >
          {cta}
          <LucideArrowBigRight className="size-3.5" aria-hidden="true" />
        </span>
      </div>
    </>
  );

  const glow: TiltCardGlow = {
    radiusPx: 320,
    color: themeTokens.accent,
    opacityPercent: 25,
    fadeEndPercent: 65,
  };

  if (isExternal) {
    return (
      <TiltCard
        href={href}
        isExternal
        glow={glow}
        style={cardStyle}
        className={cardClassName}
        {...rest}
      >
        {cardContent}
      </TiltCard>
    );
  }

  return (
    <TiltCard
      to={href}
      prefetch="intent"
      glow={glow}
      style={cardStyle}
      className={cardClassName}
      {...rest}
    >
      {cardContent}
    </TiltCard>
  );
}
