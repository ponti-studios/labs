import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area";
import * as React from "react";

import { cn } from "../../lib/utils";

interface ScrollAreaProps extends React.ComponentProps<typeof ScrollAreaPrimitive.Root> {
  orientation?: "horizontal" | "vertical";
  snap?: "start" | "center" | "none";
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, orientation = "horizontal", snap = "none", ...props }, ref) => {
    return (
      <ScrollAreaPrimitive.Root ref={ref} className={cn("relative", className)} {...props}>
        <ScrollAreaPrimitive.Viewport
          className={cn(
            "scrollbar-hide flex overflow-auto",
            orientation === "horizontal" ? "flex-row" : "flex-col",
            snap !== "none" && (orientation === "horizontal" ? "snap-x" : "snap-y"),
            snap !== "none" && "snap-mandatory",
          )}
        >
          {React.Children.map(children, (child) => {
            if (!React.isValidElement(child)) return child;
            return React.cloneElement(child as React.ReactElement<{ className?: string }>, {
              className: cn(
                snap !== "none" && orientation === "horizontal" && `snap-${snap}`,
                snap !== "none" && orientation === "vertical" && `snap-${snap}`,
                (child.props as { className?: string }).className,
              ),
            });
          })}
        </ScrollAreaPrimitive.Viewport>
      </ScrollAreaPrimitive.Root>
    );
  },
);

ScrollArea.displayName = "ScrollArea";

export { ScrollArea };
export type { ScrollAreaProps };
