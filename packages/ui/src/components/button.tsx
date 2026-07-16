import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../lib/utils";
import { LoadingSpinner } from "./loading-spinner";

const buttonVariants = cva(
  "void-focus inline-flex !cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border px-3 py-1.5 text-sm font-medium leading-5 outline-hidden transition-colors duration-150 disabled:pointer-events-none disabled:!cursor-default disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "void-hover border-transparent bg-primary text-primary-foreground [--color-interaction-hover-bg:color-mix(in_srgb,var(--color-primary)_88%,white_12%)] [--color-interaction-hover-text:var(--color-primary-foreground)] [--color-interaction-hover-border:transparent]",
        destructive:
          "void-hover border-transparent bg-destructive text-destructive-foreground [--color-interaction-hover-bg:color-mix(in_srgb,var(--color-destructive)_88%,white_12%)] [--color-interaction-hover-text:var(--color-destructive-foreground)] [--color-interaction-hover-border:transparent]",
        outline:
          "void-hover border bg-surface text-foreground [--color-interaction-hover-bg:var(--color-bg-elevated)] [--color-interaction-hover-text:var(--color-foreground)] [--color-interaction-hover-border:var(--color-border)]",
        secondary:
          "void-hover border bg-secondary text-secondary-foreground [--color-interaction-hover-bg:color-mix(in_srgb,var(--color-secondary)_88%,white_12%)] [--color-interaction-hover-text:var(--color-secondary-foreground)] [--color-interaction-hover-border:var(--color-border)]",
        ghost:
          "void-hover border-transparent bg-transparent text-foreground [--color-interaction-hover-bg:var(--color-accent)] [--color-interaction-hover-text:var(--color-accent-foreground)] [--color-interaction-hover-border:transparent]",
        link: "void-hover border-transparent bg-transparent px-0 text-foreground underline-offset-4 hover:underline [--color-interaction-hover-bg:transparent] [--color-interaction-hover-text:var(--color-secondary-foreground)] [--color-interaction-hover-border:transparent]",
      },
      size: {
        icon: "size-9 rounded-md p-0",
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
    const spinnerVariant = "sm";

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
              <LoadingSpinner variant={spinnerVariant} />
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
