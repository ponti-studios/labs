"use client";

import { motion } from "framer-motion";

export function RowToggle({ open }: { open: boolean }) {
  return (
    <motion.span
      animate={{ rotate: open ? 45 : 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="shrink-0 text-xl leading-none text-muted-foreground/50 transition-colors group-hover:text-muted-foreground"
    >
      +
    </motion.span>
  );
}
