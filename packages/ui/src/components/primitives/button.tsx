import { Button as BaseButton } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../../lib/utils";
import { Spinner } from "../feedback/spinner";

const buttonVariants = cva(
  "inline-flex min-h-9 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent px-4 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "border-input bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "border-transparent bg-transparent hover:bg-accent hover:text-accent-foreground",
        link: "border-transparent bg-transparent px-0 text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "min-h-11 px-2.5 text-sm",
        md: "min-h-11 px-3 text-sm",
        lg: "min-h-12 px-4 text-base",
        default: "",
        icon: "size-11 rounded-md p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
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
    if (asChild && React.isValidElement(children)) {
      return <BaseButton render={children as React.ReactElement} nativeButton={false} className={cn(buttonVariants({ variant, size, className }))} disabled={disabled || isLoading} {...props} ref={ref} />;
    }
    return (
      <button
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
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
