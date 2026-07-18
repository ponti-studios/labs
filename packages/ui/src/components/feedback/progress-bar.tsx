import { cn } from "../../lib/utils";

export interface ProgressBarProps {
  className?: string;
  progress?: number;
}

/** Thin linear progress indicator, distinct from the Radix-backed `Progress`. */
export function ProgressBar({ className, progress = 0 }: ProgressBarProps) {
  return (
    <div className={cn("border-border h-[2px] w-full overflow-hidden border-t", className)}>
      <div
        className={cn("border-warning h-full border-t")}
        style={{
          width: `${Math.min(100, Math.max(0, progress))}%`,
          opacity: progress === 100 ? 0 : 0.8,
        }}
      />
    </div>
  );
}
