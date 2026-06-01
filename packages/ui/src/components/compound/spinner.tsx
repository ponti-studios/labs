import * as React from "react";
import { cn } from "../../lib/utils";

export interface SpinnerProps extends React.ComponentProps<"div"> {
  label?: string | false;
}

export function Spinner({ label = "Loading", className, ...props }: SpinnerProps) {
  return (
    <div
      className={cn("flex items-center justify-center gap-2 py-12", className)}
      role="status"
      aria-label={label || "Loading"}
      {...props}
    >
      <div className="h-3 w-3 animate-spin rounded-full border-2 border-border border-t-muted-foreground" />
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </div>
  );
}
