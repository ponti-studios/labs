import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";
import * as React from "react";

import { cn } from "../../lib/utils";

function Dialog({ ...props }: React.ComponentProps<typeof BaseDialog.Root>) {
  return <BaseDialog.Root {...props} />;
}

function DialogTrigger({
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof BaseDialog.Trigger> & { asChild?: boolean }) {
  if (asChild && React.isValidElement(children)) {
    return (
      <BaseDialog.Trigger
        data-slot="dialog-trigger"
        render={(triggerProps) =>
          React.cloneElement(children as React.ReactElement<unknown>, triggerProps)
        }
        {...props}
      />
    );
  }
  return (
    <BaseDialog.Trigger data-slot="dialog-trigger" {...props}>
      {children}
    </BaseDialog.Trigger>
  );
}

function DialogPortal({ ...props }: React.ComponentProps<typeof BaseDialog.Portal>) {
  return <BaseDialog.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof BaseDialog.Close> & { asChild?: boolean }) {
  if (asChild && React.isValidElement(children)) {
    return (
      <BaseDialog.Close
        data-slot="dialog-close"
        render={(closeProps) =>
          React.cloneElement(children as React.ReactElement<unknown>, closeProps)
        }
        {...props}
      />
    );
  }
  return (
    <BaseDialog.Close data-slot="dialog-close" {...props}>
      {children}
    </BaseDialog.Close>
  );
}

function DialogOverlay({ className, ...props }: React.ComponentProps<typeof BaseDialog.Backdrop>) {
  return (
    <BaseDialog.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 fixed inset-0 z-50 bg-black/80 transition-opacity",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof BaseDialog.Popup> & {
  showCloseButton?: boolean;
}) {
  return (
    <BaseDialog.Portal data-slot="dialog-portal">
      <DialogOverlay />
      <BaseDialog.Popup
        data-slot="dialog-content"
        className={cn(
          "bg-popover text-popover-foreground data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid max-h-[90dvh] w-[calc(100%-2rem)] max-w-[30rem] translate-x-[-50%] translate-y-[-50%] gap-6 overflow-y-auto rounded-lg border p-4 duration-200 outline-none sm:p-6",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <BaseDialog.Close
            data-slot="dialog-close"
            className="text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-ring absolute top-3 right-3 inline-flex size-11 items-center justify-center rounded-md border border-transparent opacity-100 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none sm:top-4 sm:right-4 [&_svg]:pointer-events-none [&_svg]:size-4.5 [&_svg]:shrink-0"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </BaseDialog.Close>
        )}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("flex flex-col-reverse gap-3 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  );
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof BaseDialog.Title>) {
  return (
    <BaseDialog.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold tracking-tight", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof BaseDialog.Description>) {
  return (
    <BaseDialog.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground max-w-prose text-sm", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
