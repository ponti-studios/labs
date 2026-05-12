"use client";

import * as React from "react";
import { motion, useInView } from "framer-motion";

import { cn } from "@/lib/utils";

export interface AnimatedStatProps {
  value: string;
  label: string;
  index?: number;
  className?: string;
  valueClassName?: string;
  labelClassName?: string;
}

export function AnimatedStat({
  value,
  label,
  index = 0,
  className,
  valueClassName,
  labelClassName,
}: AnimatedStatProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  const [displayed, setDisplayed] = React.useState("0");

  React.useEffect(() => {
    if (!isInView) return;

    const match = value.match(/[-+]?\d[\d,]*(?:\.\d+)?/);
    if (!match) {
      setDisplayed(value);
      return;
    }

    const target = Number(match[0].replace(/,/g, ""));
    if (Number.isNaN(target)) {
      setDisplayed(value);
      return;
    }

    const prefix = value.slice(0, match.index ?? 0);
    const suffix = value.slice((match.index ?? 0) + match[0].length);
    const duration = 1400;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = eased * target;
      const formatted = Number.isInteger(target) ? Math.round(current).toString() : current.toFixed(1);

      setDisplayed(`${prefix}${formatted}${suffix}`);

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isInView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.14, ease: [0.16, 1, 0.3, 1] }}
      className={cn("flex flex-col items-center gap-4 text-center", className)}
    >
      <span
        className={cn(
          "text-[clamp(2.8rem,7vw,5.5rem)] font-normal leading-none tracking-[-0.04em] tabular-nums",
          valueClassName,
        )}
      >
        {displayed}
      </span>
      <span
        className={cn(
          "text-[0.65rem] uppercase tracking-[0.28em] text-muted-foreground",
          labelClassName,
        )}
      >
        {label}
      </span>
    </motion.div>
  );
}
