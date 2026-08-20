import type { ReactNode } from "react";
import { RevealGroup, RevealItem } from "~/components/Reveal";
import { cn } from "~/lib/utils";

type StepGridProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Numbered-card grid shell — shared by "How we start" and "What I do".
 * Cells sit `gap-px` apart so the wrapper's own background shows through as a
 * hairline divider; pass a `bg-*` in `className` that reads correctly against
 * each `StepCard`'s own background (dark panel vs. default page surface).
 */
export function StepGrid({ children, className }: StepGridProps) {
  return (
    <RevealGroup
      as="ol"
      className={cn(
        "grid grid-cols-1 gap-px overflow-hidden rounded-[22px] sm:grid-cols-2",
        className,
      )}
    >
      {children}
    </RevealGroup>
  );
}

type StepCardProps = {
  id?: string;
  index: number;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
  indexClassName?: string;
};

export function StepCard({ id, index, title, children, className, indexClassName }: StepCardProps) {
  return (
    <RevealItem id={id} as="li" className={cn("flex min-h-[190px] flex-col p-6", className)}>
      <span className={cn("ref-tag mb-10", indexClassName)}>
        {String(index).padStart(2, "0")}
      </span>
      <div className="flex flex-col gap-1.5">
        <span className="text-lg font-semibold tracking-tight">{title}</span>
        {children}
      </div>
    </RevealItem>
  );
}
