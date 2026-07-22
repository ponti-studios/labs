import { X } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "../../lib/utils";

export interface FilterChipProps {
  label: ReactNode;
  onRemove: () => void;
  onClick?: () => void;
  className?: string;
}

/** An applied filter with an optional edit action and an explicit remove action. */
export function FilterChip({ label, onRemove, onClick, className }: FilterChipProps) {
  const labelContent = onClick ? (
    <button type="button" className="min-h-11 px-3 text-left" onClick={onClick}>
      {label}
    </button>
  ) : (
    <span className="flex min-h-11 items-center px-3">{label}</span>
  );

  return (
    <span
      className={cn(
        "border-border bg-secondary text-secondary-foreground inline-flex items-center rounded-full border text-sm font-medium",
        className,
      )}
    >
      {labelContent}
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground mr-1 flex size-10 items-center justify-center rounded-full"
        onClick={onRemove}
        aria-label={`Remove filter: ${typeof label === "string" ? label : "selected filter"}`}
      >
        <X className="size-4" aria-hidden />
      </button>
    </span>
  );
}
