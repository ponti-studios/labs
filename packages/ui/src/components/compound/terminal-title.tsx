"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

export interface TerminalTitleProps {
  title: string;
  taglines?: string[];
  className?: string;
  titleClassName?: string;
  taglineClassName?: string;
  typingDelayMs?: number;
  blinkIntervalMs?: number;
}

const DEFAULT_TAGLINES = [
  "AI that actually lands.",
  "for founders who ship.",
  "for teams who refuse to compromise.",
];

function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => setPrefersReduced(media.matches);
    update();

    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return prefersReduced;
}

export function TerminalTitle({
  title,
  taglines = DEFAULT_TAGLINES,
  className,
  titleClassName,
  taglineClassName,
  typingDelayMs = 38,
  blinkIntervalMs = 530,
}: TerminalTitleProps) {
  const prefersReduced = usePrefersReducedMotion();
  const [phase, setPhase] = React.useState<"typing-title" | "blinking" | "cycling" | "settled">(
    "typing-title",
  );
  const [displayedTitle, setDisplayedTitle] = React.useState("");
  const [taglineIndex, setTaglineIndex] = React.useState(0);
  const [displayedTagline, setDisplayedTagline] = React.useState("");
  const [showCursor, setShowCursor] = React.useState(true);

  React.useEffect(() => {
    const id = window.setInterval(() => setShowCursor((value) => !value), blinkIntervalMs);
    return () => window.clearInterval(id);
  }, [blinkIntervalMs]);

  React.useEffect(() => {
    if (!prefersReduced) return;

    setDisplayedTitle(title);
    setDisplayedTagline(taglines[0] ?? "");
    setPhase("settled");
  }, [prefersReduced, title, taglines]);

  React.useEffect(() => {
    if (prefersReduced || phase !== "typing-title") return;

    if (displayedTitle.length < title.length) {
      const id = window.setTimeout(
        () => setDisplayedTitle(title.slice(0, displayedTitle.length + 1)),
        typingDelayMs + Math.random() * 22,
      );
      return () => window.clearTimeout(id);
    }

    const id = window.setTimeout(() => setPhase("blinking"), 1400);
    return () => window.clearTimeout(id);
  }, [displayedTitle, phase, prefersReduced, title, typingDelayMs]);

  React.useEffect(() => {
    if (prefersReduced || phase !== "blinking") return;

    const id = window.setTimeout(() => setPhase("cycling"), 1000);
    return () => window.clearTimeout(id);
  }, [phase, prefersReduced]);

  React.useEffect(() => {
    if (prefersReduced || phase !== "cycling") return;

    const target = taglines[taglineIndex] ?? "";
    if (displayedTagline.length < target.length) {
      const id = window.setTimeout(
        () => setDisplayedTagline(target.slice(0, displayedTagline.length + 1)),
        28 + Math.random() * 18,
      );
      return () => window.clearTimeout(id);
    }

    if (taglineIndex < taglines.length - 1) {
      const id = window.setTimeout(() => {
        setDisplayedTagline("");
        setTaglineIndex((value) => value + 1);
      }, 900);
      return () => window.clearTimeout(id);
    }

    const id = window.setTimeout(() => setPhase("settled"), 800);
    return () => window.clearTimeout(id);
  }, [displayedTagline, phase, prefersReduced, taglineIndex, taglines]);

  const cursor = showCursor ? "_" : " ";
  const activeTagline = taglines[taglineIndex] ?? "";

  return (
    <div className={cn("space-y-4", className)}>
      <h1
        className={cn(
          "text-5xl font-normal uppercase leading-[0.92] tracking-[-0.04em] md:text-6xl lg:text-7xl",
          titleClassName,
        )}
      >
        {displayedTitle}
        {!prefersReduced && phase === "typing-title" && (
          <span className="text-muted-foreground">{cursor}</span>
        )}
      </h1>
      {(phase === "cycling" || phase === "settled" || prefersReduced) && (
        <p
          className={cn(
            "text-xl font-normal tracking-tight text-muted-foreground md:text-2xl",
            taglineClassName,
          )}
        >
          {prefersReduced ? activeTagline : displayedTagline}
          {!prefersReduced && phase === "cycling" && <span>{cursor}</span>}
        </p>
      )}
    </div>
  );
}
