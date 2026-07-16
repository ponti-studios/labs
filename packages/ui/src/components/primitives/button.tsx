import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../../lib/utils";
import { Spinner } from "../feedback/spinner";

const buttonVariants = cva(
  "inline-flex min-h-11 !cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border px-3 py-1.5 text-sm font-medium leading-5 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:!cursor-default [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-accent text-on-accent hover:bg-accent-hover active:bg-accent-pressed disabled:border-subtle disabled:bg-panel disabled:text-disabled",
        destructive:
          "border-transparent bg-destructive text-on-destructive hover:bg-destructive-hover active:bg-destructive-pressed disabled:border-subtle disabled:bg-panel disabled:text-disabled",
        outline:
          "border-default bg-transparent text-primary hover:bg-surface-hover active:bg-surface-pressed disabled:border-subtle disabled:text-disabled",
        secondary:
          "border-default bg-panel text-primary hover:bg-surface-hover active:bg-surface-pressed disabled:border-subtle disabled:bg-panel disabled:text-disabled",
        ghost:
          "border-transparent bg-transparent text-secondary hover:bg-surface-hover hover:text-primary active:bg-surface-pressed disabled:text-disabled",
        link: "border-transparent bg-transparent px-0 text-accent hover:text-accent-hover disabled:text-disabled underline-offset-4 hover:underline",
      },
      size: {
        icon: "size-11 rounded-md p-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  loadingLabel?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      disabled,
      isLoading = false,
      loadingLabel = "Loading",
      variant,
      size,
      asChild = false,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }), isLoading && "relative")}
        style={{
          ...props.style,
          cursor: disabled || isLoading ? "default" : "pointer",
        }}
        type="button"
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        aria-label={isLoading ? loadingLabel : ariaLabel}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="opacity-0">{children}</span>
            <span className="absolute inset-0 inline-flex items-center justify-center">
              <Spinner size="sm" aria-hidden="true" />
            </span>
            <span className="sr-only">{loadingLabel}</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
