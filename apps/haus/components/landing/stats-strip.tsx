"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface StatItem {
  value: string;
  label: string;
}

interface StatsStripProps {
  clients: StatItem;
  arr: StatItem;
  reduction: StatItem;
}

function AnimatedStat({ value, label }: StatItem) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  const [displayed, setDisplayed] = useState("0");

  useEffect(() => {
    if (!isInView) return;

    // Extract numeric part for animation
    const match = value.match(/[\d.]+/);
    if (!match) {
      setDisplayed(value);
      return;
    }

    const target = parseFloat(match[0]);
    const prefix = value.slice(0, value.indexOf(match[0]));
    const suffix = value.slice(value.indexOf(match[0]) + match[0].length);
    const duration = 1200;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;
      const formatted = target % 1 === 0 ? Math.round(current).toString() : current.toFixed(1);
      setDisplayed(`${prefix}${formatted}${suffix}`);
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [isInView, value]);

  return (
    <div ref={ref} className="flex flex-col items-start gap-2 border-r border-border last:border-r-0 px-8 first:pl-0 last:pr-0">
      <motion.span
        initial={{ opacity: 0, y: 8 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="text-4xl font-normal tracking-tight tabular-nums"
      >
        {displayed}
      </motion.span>
      <motion.span
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.45 } : {}}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="text-xs uppercase tracking-[0.2em]"
      >
        {label}
      </motion.span>
    </div>
  );
}

export function StatsStrip({ clients, arr, reduction }: StatsStripProps) {
  return (
    <section className="border-y border-border py-10">
      <div className="container">
        <div className="flex items-center justify-start gap-0 overflow-x-auto">
          <AnimatedStat {...clients} />
          <AnimatedStat {...arr} />
          <AnimatedStat {...reduction} />
        </div>
      </div>
    </section>
  );
}
