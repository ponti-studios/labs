import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

// Mirrors @ponti-studios/ui's --ease-out token (cubic-bezier(0, 0, 0.2, 1)) —
// Motion needs the literal curve here, it can't consume a CSS custom
// property, so this is a read of the design system's own value, not a
// parallel one.
const EASE_OUT = [0, 0, 0.2, 1] as const;

/**
 * Wraps a grid/list of content so it fades and lifts in, staggered, the
 * first time it scrolls into view — instead of popping in fully rendered.
 * Occasional (once per page view), so this is inside the delight budget;
 * `once: true` keeps it from re-triggering on scroll-back.
 */
export function RevealGroup({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "ol" | "ul";
}) {
  const reduceMotion = useReducedMotion();
  const MotionTag = as === "ol" ? motion.ol : as === "ul" ? motion.ul : motion.div;
  return (
    <MotionTag
      className={className}
      initial={reduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.06 } },
      }}
    >
      {children}
    </MotionTag>
  );
}

export function RevealItem({
  children,
  className,
  id,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  as?: "div" | "li";
}) {
  const MotionTag = as === "li" ? motion.li : motion.div;
  return (
    <MotionTag
      id={id}
      className={className}
      variants={{
        hidden: { opacity: 0, transform: "translateY(14px)" },
        visible: {
          opacity: 1,
          transform: "translateY(0px)",
          transition: { duration: 0.45, ease: EASE_OUT },
        },
      }}
    >
      {children}
    </MotionTag>
  );
}
