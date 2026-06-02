"use client";

import * as React from "react";

import { cn } from "../../lib/utils";

export const Tag = React.forwardRef<
  React.ComponentRef<"span">,
  React.ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "inline-flex items-center rounded-lg bg-secondary/40 px-2 py-1 text-xs font-medium text-secondary-foreground",
      className,
    )}
    {...props}
  />
));
Tag.displayName = "Tag";
