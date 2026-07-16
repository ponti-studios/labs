"use client";

import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/utils";

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ComponentRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "overlay-backdrop data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 transition-opacity",
      className,
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = cva(
  "bg-background text-foreground border-subtle fixed z-50 flex flex-col gap-6 border p-4 md:p-6",
  {
    variants: {
      side: {
        top: "sheet-slide-in-top sheet-slide-out-top sheet-edge-bottom inset-x-0 top-0 max-h-[90dvh] rounded-b-xl border-t-0 border-r-0 border-l-0",
        bottom:
          "sheet-slide-in-bottom sheet-slide-out-bottom sheet-edge-top inset-x-0 bottom-0 max-h-[90dvh] min-h-[30dvh] rounded-t-xl border-r-0 border-b-0 border-l-0 pb-[max(1rem,env(safe-area-inset-bottom))]",
        left: "sheet-slide-in-left sheet-slide-out-left sheet-edge-right inset-y-0 left-0 h-full w-3/4 max-w-xs rounded-r-xl border-t-0 border-b-0 border-l-0 sm:max-w-sm",
        right:
          "sheet-slide-in-right sheet-slide-out-right sheet-edge-left inset-y-0 right-0 h-full w-3/4 max-w-xs rounded-l-xl border-t-0 border-r-0 border-b-0 sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  },
);

interface SheetContentProps
  extends
    React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ComponentRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content ref={ref} className={cn(sheetVariants({ side }), className)} {...props}>
      <SheetPrimitive.Close className="sheet-glass-control text-muted-foreground hover:bg-muted/70 hover:text-foreground focus-visible:outline-ring absolute top-3 right-3 inline-flex size-11 items-center justify-center rounded-md border border-transparent transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none md:top-4 md:right-4">
        <X className="size-4.5" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
      {children}
    </SheetPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col gap-2 text-left", className)} {...props} />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("mt-auto flex flex-col-reverse gap-3 sm:flex-row sm:justify-end", className)}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
  React.ComponentRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("heading-2 text-foreground", className)}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ComponentRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("body-2 text-muted-foreground max-w-prose", className)}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
};
