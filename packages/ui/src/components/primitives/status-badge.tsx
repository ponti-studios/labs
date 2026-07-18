import type { ReactNode } from "react";

import { Badge, type badgeVariants } from "./badge";
import type { VariantProps } from "class-variance-authority";

export interface StatusBadgeConfig {
  label: string;
  variant?: VariantProps<typeof badgeVariants>["variant"];
  className?: string;
  icon?: ReactNode;
}

export interface StatusBadgeProps<T extends string> {
  status: T | null | undefined;
  config: Record<T, StatusBadgeConfig>;
  fallback?: StatusBadgeConfig;
}

/** Renders a `Badge` from a status → { label, variant, icon } config map. */
export function StatusBadge<T extends string>({ status, config, fallback }: StatusBadgeProps<T>) {
  const entry = (status != null ? config[status] : undefined) ?? fallback;

  if (!entry) {
    return null;
  }

  return (
    <Badge variant={entry.variant ?? "outline"} className={entry.className}>
      {entry.icon}
      {entry.label}
    </Badge>
  );
}
