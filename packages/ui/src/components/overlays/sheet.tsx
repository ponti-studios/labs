"use client";

import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import * as React from "react";

import { cn } from "../../lib/utils";

const Sheet = SheetPrimitive.Root;

function SheetTrigger({
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger> & { asChild?: boolean }) {
  return (
    <SheetPrimitive.Trigger
      {...(asChild && React.isValidElement(children)
        ? { render: children as React.ReactElement }
        : {})}
      {...props}
    >
      {!asChild && children}
    </SheetPrimitive.Trigger>
  );
}

function SheetClose({
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close> & { asChild?: boolean }) {
  return (
    <SheetPrimitive.Close
      {...(asChild && React.isValidElement(children)
        ? { render: children as React.ReactElement }
        : {})}
      {...props}
    >
      {!asChild && children}
    </SheetPrimitive.Close>
  );
}

const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ComponentRef<typeof SheetPrimitive.Backdrop>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Backdrop>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Backdrop
    className={cn(
      "data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 fixed inset-0 z-50 bg-black/80 transition-opacity",
      className,
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = "SheetOverlay";

const sheetClassName =
  "bg-background text-foreground data-open:animate-in data-closed:animate-out fixed inset-x-0 bottom-0 z-50 flex max-h-[90dvh] min-h-[30dvh] flex-col gap-6 rounded-t-xl border border-b-0 border-l-0 border-r-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:inset-y-0 md:right-0 md:bottom-auto md:left-auto md:h-full md:w-3/4 md:max-w-sm md:min-h-0 md:rounded-t-none md:rounded-l-xl md:border-t-0 md:border-r-0 md:border-b-0 md:border-l md:p-6 md:pb-6";

interface SheetContentProps extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Popup> {}

const SheetContent = React.forwardRef<
  React.ComponentRef<typeof SheetPrimitive.Popup>,
  SheetContentProps
>(({ className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Popup ref={ref} className={cn(sheetClassName, className)} {...props}>
      <SheetPrimitive.Close className="text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-ring absolute top-3 right-3 inline-flex size-11 items-center justify-center rounded-md border border-transparent transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none md:top-4 md:right-4">
        <X className="size-4.5" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
      {children}
    </SheetPrimitive.Popup>
  </SheetPortal>
));
SheetContent.displayName = "SheetContent";

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
    className={cn("text-lg font-semibold tracking-tight", className)}
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
    className={cn("text-muted-foreground max-w-prose text-sm", className)}
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
