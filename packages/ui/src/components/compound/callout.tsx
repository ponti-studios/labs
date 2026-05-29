import * as React from "react";
import { cn } from "../../lib/utils";

export function InfoBox({
  children,
  title,
  className,
}: {
  children: React.ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-l-2 border-white/30 bg-white/2 px-4 py-3 font-mono text-xs space-y-2",
        className,
      )}
    >
      {title && (
        <p className="text-xs font-mono uppercase tracking-widest text-white/80">{title}</p>
      )}
      <div className="text-sm md:text-base font-mono tracking-wide leading-relaxed">{children}</div>
    </div>
  );
}

export function ResultBox({
  children,
  state = "success",
  label,
  className,
}: {
  children: React.ReactNode;
  state?: "pending" | "success" | "error" | "loading";
  label?: string;
  className?: string;
}) {
  const stateClass = {
    pending: "border-white/10 bg-white/2",
    success: "border-white/20 bg-white/5",
    error: "border-white/30 bg-white/3",
    loading: "animate-pulse border-white/15 bg-white/3",
  }[state];

  return (
    <div
      className={cn(
        "border border-white/10 bg-white/2 p-6 font-mono text-sm space-y-3",
        stateClass,
        className,
      )}
    >
      {label && (
        <p className="text-xs font-mono uppercase tracking-widest text-white/80">{label}</p>
      )}
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export function Callout({
  children,
  type = "info",
  className,
}: {
  children: React.ReactNode;
  type?: "info" | "warning" | "success";
  className?: string;
}) {
  const typeClass = {
    info: "border-white/20 bg-white/3",
    warning: "border-white/30 bg-white/4",
    success: "border-white/25 bg-white/3",
  }[type];

  return (
    <div className={cn("border-l-4 px-4 py-3 font-mono text-sm", typeClass, className)}>
      {children}
    </div>
  );
}
