import * as React from "react";
import { cn } from "../lib/utils";

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  snap?: "start" | "center" | "none";
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, orientation = "horizontal", snap = "none", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "scrollbar-hide flex overflow-auto",
          orientation === "horizontal" && "flex-row",
          orientation === "vertical" && "flex-col",
          snap !== "none" && orientation === "horizontal" && "snap-x snap-mandatory",
          snap !== "none" && orientation === "vertical" && "snap-y snap-mandatory",
          className,
        )}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child;
          if (snap !== "none") {
            return React.cloneElement(child as React.ReactElement<{ className?: string }>, {
              className: cn(`snap-${snap}`, (child.props as { className?: string }).className),
            });
          }
          return child;
        })}
      </div>
    );
  },
);
ScrollArea.displayName = "ScrollArea";

export { ScrollArea };
export type { ScrollAreaProps };
