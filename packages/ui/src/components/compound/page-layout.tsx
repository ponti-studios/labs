import * as React from "react";
import { cn } from "../../lib/utils";

export function Header({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-12 md:mb-16">
      <h1 className="text-2xl md:text-3xl font-mono uppercase tracking-wider font-bold">{title}</h1>
      {description && (
        <p className="mt-4 text-sm md:text-base font-mono tracking-wide leading-relaxed text-secondary">
          {description}
        </p>
      )}
    </div>
  );
}

export function Section({
  title,
  subtitle,
  children,
  className,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border-t border-white/10 pt-12 md:pt-16 first:border-t-0", className)}>
      {title && (
        <div className="mb-8 md:mb-12">
          <h2 className="text-lg md:text-xl font-mono uppercase tracking-wider mt-2">{title}</h2>
          {subtitle && (
            <p className="mt-2 text-white/60 font-mono uppercase text-xs tracking-widest">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
