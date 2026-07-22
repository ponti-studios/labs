import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import type * as React from "react";
import { DayPicker } from "react-day-picker";

import { cn } from "../../lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("relative w-fit rounded-md p-4", className)}
      classNames={{
        root: "text-foreground",
        months: "flex flex-col gap-4 sm:flex-row",
        month: "flex flex-col gap-4",
        month_caption: "relative flex h-8 items-center justify-center",
        caption_label: "text-sm font-medium",
        nav: "absolute inset-x-4 top-4 flex items-center justify-between",
        button_previous:
          "inline-flex size-8 p-2 items-center justify-center rounded-full border bg-background text-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
        button_next:
          "inline-flex size-8 p-2 items-center justify-center rounded-full border bg-background text-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "flex size-8 items-center justify-center text-[0.8rem] font-normal text-muted-foreground",
        week: "mt-1 flex w-full",
        day: "relative size-8 p-0 text-center text-lg focus-within:z-20",
        day_button:
          "inline-flex size-6 items-center justify-center rounded-md text-sm font-normal disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
        selected:
          "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary/90",
        today: "[&>button]:bg-primary [&>button]:text-primary-foreground",
        outside: "text-muted-foreground [&>button]:text-muted-foreground",
        disabled: "text-muted-foreground opacity-50",
        range_start:
          "rounded-l-md bg-primary [&>button]:bg-primary [&>button]:text-primary-foreground",
        range_middle: "bg-primary [&>button]:rounded-none [&>button]:text-primary-foreground",
        range_end:
          "rounded-r-md bg-primary [&>button]:bg-primary [&>button]:text-primary-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ className: iconClassName, orientation, ...iconProps }) => {
          if (orientation === "left") {
            return <ChevronLeft className={cn("size-4", iconClassName)} {...iconProps} />;
          }

          if (orientation === "right") {
            return <ChevronRight className={cn("size-4", iconClassName)} {...iconProps} />;
          }

          if (orientation === "up") {
            return <ChevronUp className={cn("size-4", iconClassName)} {...iconProps} />;
          }

          return <ChevronDown className={cn("size-4", iconClassName)} {...iconProps} />;
        },
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
