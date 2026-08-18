import type { ReactNode } from "react";

export function Kicker({ children }: { children: ReactNode }) {
  return (
    <div className="ui-eyebrow text-muted-foreground flex items-center gap-2">
      <span className="bg-accent inline-block size-2 shrink-0 rounded-full" aria-hidden="true" />
      {children}
    </div>
  );
}
