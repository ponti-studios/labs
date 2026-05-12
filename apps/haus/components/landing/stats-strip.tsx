"use client";

import { useTranslations } from "next-intl";
import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface StatItem {
  value: string;
  label: string;
}

function AnimatedStat({ value, label, index }: StatItem & { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  const [displayed, setDisplayed] = useState("0");

  useEffect(() => {
    if (!isInView) return;

    const match = value.match(/[\d.]+/);
    if (!match) { setDisplayed(value); return; }

    const target = parseFloat(match[0]);
    const prefix = value.slice(0, value.indexOf(match[0]));
    const suffix = value.slice(value.indexOf(match[0]) + match[0].length);
    const duration = 1400;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = eased * target;
      const formatted = target % 1 === 0 ? Math.round(current).toString() : current.toFixed(1);
      setDisplayed(`${prefix}${formatted}${suffix}`);
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [isInView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.14, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center gap-4 text-center"
    >
      <span className="text-[clamp(2.8rem,7vw,5.5rem)] font-normal leading-none tracking-[-0.04em] tabular-nums">
        {displayed}
      </span>
      <span className="text-[0.65rem] uppercase tracking-[0.28em] text-muted-foreground">
        {label}
      </span>
    </motion.div>
  );
}

export function StatsStrip() {
  const t = useTranslations("Studio");
  const stats = t.raw("stats") as {
    clients: StatItem;
    arr: StatItem;
    reduction: StatItem;
  };

  return (
    <section className="border-y border-border py-20 md:py-28">
      <div className="container">
        <div className="grid grid-cols-3 divide-x divide-border">
          <AnimatedStat {...stats.clients} index={0} />
          <AnimatedStat {...stats.arr} index={1} />
          <AnimatedStat {...stats.reduction} index={2} />
        </div>
      </div>
    </section>
  );
}
