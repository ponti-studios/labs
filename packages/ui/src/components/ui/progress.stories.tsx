import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Progress } from "./progress";

const meta: Meta<typeof Progress> = {
  component: Progress,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-full max-w-sm space-y-1">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 60,
  },
};

export const Empty: Story = {
  args: {
    value: 0,
  },
};

export const Full: Story = {
  args: {
    value: 100,
  },
};

export const Animated: Story = {
  render: () => {
    const [value, setValue] = React.useState(0);

    React.useEffect(() => {
      const timer = setInterval(() => {
        setValue((prev) => {
          if (prev >= 80) {
            clearInterval(timer);
            return 80;
          }
          return prev + 2;
        });
      }, 40);
      return () => clearInterval(timer);
    }, []);

    return (
      <div className="w-full max-w-sm space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Loading…</span>
          <span className="font-medium tabular-nums">{value}%</span>
        </div>
        <Progress value={value} />
      </div>
    );
  },
};
