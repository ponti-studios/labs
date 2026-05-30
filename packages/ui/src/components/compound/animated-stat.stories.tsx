import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { AnimatedStat } from "./animated-stat";

const meta: Meta<typeof AnimatedStat> = {
  component: AnimatedStat,
  tags: ["autodocs"],
  argTypes: {
    value: { control: "text" },
    label: { control: "text" },
    index: { control: "number" },
    className: { control: "text" },
    valueClassName: { control: "text" },
    labelClassName: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: "98.6%",
    label: "Customer satisfaction",
    index: 0,
  },
};

export const Large: Story = {
  args: {
    value: "1.2M",
    label: "Active users",
    index: 0,
  },
};

export const Grid: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-16 px-8 py-6">
      <AnimatedStat value="98.6%" label="Customer satisfaction" index={0} />
      <AnimatedStat value="1.2M" label="Active users" index={1} />
      <AnimatedStat value="$4.8B" label="Revenue processed" index={2} />
    </div>
  ),
};

export const CustomStyles: Story = {
  args: {
    value: "42",
    label: "Projects shipped",
    index: 0,
    valueClassName: "text-primary",
    labelClassName: "text-primary/60",
  },
};
