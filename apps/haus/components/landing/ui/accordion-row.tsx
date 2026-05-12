"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { type ReactNode, useRef } from "react";
import { RowToggle } from "./row-toggle";

export function AccordionRow({
  index,
  isOpen,
  onToggleAction,
  title,
  badge,
  aside,
  children,
}: {
  index: number;
  isOpen: boolean;
  onToggleAction: () => void;
  title: string;
  badge?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
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
        onClick={onToggleAction}
        className="group flex w-full items-center justify-between py-5 text-left"
      >
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
