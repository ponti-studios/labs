import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import type { DateRange } from "react-day-picker";

import { Calendar } from "./calendar";

const meta: Meta = {
  component: Calendar,
  tags: ["autodocs"],
  argTypes: {
    showOutsideDays: { control: "boolean" },
  },
};

export default meta;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Story = StoryObj<any>;

export const Single: Story = {
  render: () => {
    const [selected, setSelected] = React.useState<Date | undefined>(undefined);
    return (
      <div className="flex flex-col items-start gap-4">
        <Calendar mode="single" selected={selected} onSelect={setSelected} showOutsideDays />
        <p className="text-sm text-muted-foreground px-3">
          {selected ? `Selected: ${selected.toLocaleDateString()}` : "No date selected"}
        </p>
      </div>
    );
  },
};

export const Range: Story = {
  render: () => {
    const [range, setRange] = React.useState<DateRange | undefined>(undefined);
    return (
      <div className="flex flex-col items-start gap-4">
        <Calendar
          mode="range"
          selected={range}
          onSelect={setRange}
          showOutsideDays
          numberOfMonths={2}
        />
        <p className="text-sm text-muted-foreground px-3">
          {range?.from
            ? range.to
              ? `${range.from.toLocaleDateString()} — ${range.to.toLocaleDateString()}`
              : `From: ${range.from.toLocaleDateString()}`
            : "No range selected"}
        </p>
      </div>
    );
  },
};

export const Multiple: Story = {
  render: () => {
    const [dates, setDates] = React.useState<Date[] | undefined>(undefined);
    return (
      <div className="flex flex-col items-start gap-4">
        <Calendar mode="multiple" selected={dates} onSelect={setDates} showOutsideDays />
        <p className="text-sm text-muted-foreground px-3">
          {dates && dates.length > 0
            ? `${dates.length} date${dates.length > 1 ? "s" : ""} selected`
            : "No dates selected"}
        </p>
      </div>
    );
  },
};
