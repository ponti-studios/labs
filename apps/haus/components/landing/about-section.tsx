"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { SectionLabel, SectionHeading } from "./shared";

interface AboutSectionProps {
  label: string;
  title: string;
  description: string;
  antiposition?: string;
}

export function AboutSection({ label, title, description, antiposition }: AboutSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section id="about" className="border-t border-border bg-background">
      <div ref={ref} className="container py-20 md:py-28">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24 lg:items-start">

          {/* Left: heading + antiposition */}
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4 }}
            >
              <SectionLabel>{label}</SectionLabel>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <SectionHeading className="mt-4 text-[clamp(1.75rem,4vw,3rem)] leading-tight">
                {title}
              </SectionHeading>
            </motion.div>

            {antiposition && (
              <motion.p
                initial={{ opacity: 0, x: -8 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="mt-10 border-l-2 border-foreground pl-5 text-base font-medium text-foreground leading-7"
              >
                {antiposition}
              </motion.p>
            )}
          </div>

          {/* Right: body copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col justify-center"
          >
            <p className="text-base leading-8 text-muted-foreground">{description}</p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
