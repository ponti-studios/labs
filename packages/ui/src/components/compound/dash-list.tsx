"use client";

import * as React from "react";

import { cn } from "../../lib/utils";

export interface DashListProps<T> extends Omit<React.ComponentProps<"ul">, "children"> {
  items: readonly T[];
  getKey?: (item: T, index: number) => React.Key;
  renderItem?: (item: T, index: number) => React.ReactNode;
  marker?: React.ReactNode;
  itemClassName?: string;
  markerClassName?: string;
}

export function DashList<T extends React.ReactNode>({
  items,
  getKey,
  renderItem,
  marker = "-",
  className,
  itemClassName,
  markerClassName,
  ...props
}: DashListProps<T>) {
  return (
    <ul className={cn("space-y-2", className)} {...props}>
      {items.map((item, index) => (
        <li
          key={getKey ? getKey(item, index) : typeof item === "string" ? item : index}
          className={cn("flex gap-2 text-sm leading-6 text-foreground", itemClassName)}
        >
          <span className={cn("mt-0.5 shrink-0 text-muted-foreground", markerClassName)}>
            {marker}
          </span>
          <span>{renderItem ? renderItem(item, index) : item}</span>
        </li>
      ))}
    </ul>
  );
}
