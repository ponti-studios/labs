import { useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "~/lib/utils";

// Same ramp as AsciiField, so headings "decode" out of the hero's dot-field.
const RAMP = ["·", ":", "+", "*", "#"] as const;
const PER_CHAR_MS = 28;
const MAX_MS = 900;
const SETTLE_MS = 220; // how long a glyph keeps flickering before it resolves
const FRAME_MS = 60;

/**
 * Headline text that decodes from dot-field glyphs into the real characters
 * the first time it scrolls into view, left to right.
 *
 * Every character keeps its real glyph in the layout (hidden until resolved)
 * and the scrambled glyph is overlaid, centered, so nothing shifts or rewraps.
 * Real text stays in the DOM for screen readers; the animated layer is
 * aria-hidden. Server render and `prefers-reduced-motion` show the final text.
 */
export function GlyphText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const total = text.replace(/ /g, "").length;
  // `resolved` = how many characters are final; Infinity = everything (default / SSR).
  const [state, setState] = useState({ resolved: Number.POSITIVE_INFINITY, frame: 0 });

  useEffect(() => {
    if (reduceMotion) {
      setState({ resolved: Number.POSITIVE_INFINITY, frame: 0 });
      return;
    }
    if (!inView) {
      setState({ resolved: 0, frame: 0 });
      return;
    }
    const perChar = Math.min(PER_CHAR_MS, (MAX_MS - SETTLE_MS) / Math.max(total, 1));
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const elapsed = now - start;
      const resolved = Math.min(total, Math.floor((elapsed - SETTLE_MS) / perChar) + 1);
      setState({ resolved: Math.max(0, resolved), frame: Math.floor(elapsed / FRAME_MS) });
      if (resolved < total) raf = requestAnimationFrame(step);
      else setState({ resolved: Number.POSITIVE_INFINITY, frame: 0 });
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduceMotion, total]);

  let index = -1;
  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.split(" ").map((word, w, words) => (
          <span key={w}>
            <span className="inline-block whitespace-nowrap">
              {word.split("").map((char, c) => {
                index += 1;
                const done = index < state.resolved;
                const glyph = RAMP[(index * 7 + state.frame * 3) % RAMP.length];
                return (
                  <span key={c} className="relative inline-block">
                    <span className={cn(!done && "opacity-0")}>{char}</span>
                    {!done && (
                      <span className="text-muted-foreground absolute inset-0 text-center font-mono">
                        {glyph}
                      </span>
                    )}
                  </span>
                );
              })}
            </span>
            {w < words.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </span>
  );
}
