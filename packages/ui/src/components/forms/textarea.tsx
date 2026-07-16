import * as React from "react";

import { cn } from "../../lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-secondary aria-invalid:ring-destructive/20 aria-invalid:border-destructive focus-visible:ring-focus flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
