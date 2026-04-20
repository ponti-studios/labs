"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface VentureItem {
  name: string;
  description: string;
  status: string;
}

interface VenturesSectionProps {
  label: string;
  title: string;
  subtitle: string;
  items: VentureItem[];
}

export function VenturesSection({ label, title, subtitle, items }: VenturesSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section className="border-t border-border bg-muted">
      <div className="container py-20 md:py-28">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {label}
            </span>
            <h2 className="mt-3 text-3xl font-normal uppercase tracking-[-0.04em]">{title}</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">{subtitle}</p>
        </div>

        <div ref={ref} className="grid gap-5 md:grid-cols-3">
          {items.map((venture, i) => (
            <motion.div
              key={venture.name}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="border border-border bg-background p-7 flex flex-col justify-between"
              style={{ minHeight: "180px" }}
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-foreground opacity-40" />
                    {venture.status}
                  </span>
                </div>
                <div className="text-2xl font-normal uppercase tracking-[-0.03em] mb-3">
                  {venture.name}
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{venture.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
