"use client";

import { AnimatePresence, motion, useReducedMotion, useScroll } from "framer-motion";
import { useRef, useState } from "react";
import { SectionLabel, SectionHeading } from "./shared";

interface PrincipleItem {
  title: string;
  description: string;
}

interface ManifestoSectionProps {
  label: string;
  title: string;
  items: PrincipleItem[];
}

function KineticPrinciples({ items }: { items: PrincipleItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  scrollYProgress.on("change", (v) => {
    const idx = Math.min(Math.floor(v * items.length), items.length - 1);
    setActiveIndex(idx);
  });

  if (prefersReduced) {
    return (
      <div className="space-y-6 lg:max-w-2xl">
        {items.map((item) => (
          <div key={item.title}>
            <h3 className="text-2xl font-normal uppercase tracking-[-0.03em]">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ height: `${items.length * 100}vh` }}
      className="relative"
    >
      <div className="sticky top-0 h-screen flex items-center">
        <div className="w-full grid lg:grid-cols-[1fr_auto] gap-16 items-center">

          {/* Left: principle titles */}
          <div className="space-y-0">
            {items.map((item, i) => {
              const isActive = i === activeIndex;
              return (
                <motion.div
                  key={item.title}
                  animate={{ opacity: isActive ? 1 : 0.13, scale: isActive ? 1 : 0.97 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="py-3 border-b border-border last:border-0 cursor-default"
                  onClick={() => setActiveIndex(i)}
                >
                  <motion.h3
                    animate={{ fontSize: isActive ? "clamp(2rem, 5vw, 4.5rem)" : "1.1rem" }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="font-normal uppercase tracking-[-0.04em] leading-none"
                  >
                    {item.title}
                  </motion.h3>
                </motion.div>
              );
            })}
          </div>

          {/* Right: description */}
          <div className="lg:w-72 xl:w-96">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div className="mb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {String(activeIndex + 1).padStart(2, "0")} /{" "}
                  {String(items.length).padStart(2, "0")}
                </div>
                <p className="text-base leading-7 text-muted-foreground">
                  {items[activeIndex].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}

export function ManifestoSection({ label, title, items }: ManifestoSectionProps) {
  return (
    <section className="bg-background border-t border-border">
      <div className="container py-20 md:py-28">
        <div className="mb-16">
          <SectionLabel>{label}</SectionLabel>
          <SectionHeading className="mt-3 text-3xl">{title}</SectionHeading>
        </div>
        <KineticPrinciples items={items} />
      </div>
    </section>
  );
}
