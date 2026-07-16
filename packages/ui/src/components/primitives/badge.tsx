import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded border border-transparent px-1.5 py-px text-xs font-medium [&>svg]:size-3 [&>svg]:pointer-events-none aria-invalid:border-destructive aria-invalid:ring-destructive/20",
  {
    variants: {
      variant: {
        default: "bg-accent text-on-accent [a&]:[a&]: [a&]: [a&]:",
        secondary: "bg-panel text-primary [a&]:[a&]: [a&]: [a&]:",
        destructive: "bg-destructive text-on-destructive [a&]:[a&]: [a&]: [a&]:",
        outline: "border-default text-primary [a&]:[a&]: [a&]: [a&]:",
        ghost: "[a&]:[a&]: [a&]: [a&]:",
        link: "text-primary underline-offset-4 [a&]:[a&]:hover:underline [a&]: [a&]: [a&]:",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
