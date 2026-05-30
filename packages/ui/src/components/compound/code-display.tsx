import * as React from "react";
import { cn } from "../../lib/utils";

export function CodeBlock({
  children,
  className,
}: {
  children: string;
  language?: string;
  className?: string;
}) {
  return (
    <pre
      style={{ overflowWrap: "anywhere" }}
      className={cn(
        "bg-white/2 border border-white/10 p-4 overflow-x-auto",
        "text-xs md:text-sm font-mono whitespace-pre-wrap",
        className,
      )}
    >
      <code>{children}</code>
    </pre>
  );
}

export function DiffDisplay({
  before,
  after,
  beforeLabel = "BEFORE",
  afterLabel = "AFTER",
}: {
  before: string | React.ReactNode;
  after: string | React.ReactNode;
  beforeLabel?: string;
  afterLabel?: string;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <div className="space-y-2">
        <p className="text-xs font-mono uppercase tracking-widest text-white/80">{beforeLabel}</p>
        <div
          style={{ overflowWrap: "anywhere" }}
          className="bg-white/2 border border-white/10 p-4 text-xs md:text-sm font-mono whitespace-pre-wrap"
        >
          {before}
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-mono uppercase tracking-widest text-white/80">{afterLabel}</p>
        <div
          style={{ overflowWrap: "anywhere" }}
          className="bg-white/5 border border-white/20 p-4 text-xs md:text-sm font-mono whitespace-pre-wrap"
        >
          {after}
        </div>
      </div>
    </div>
  );
}
