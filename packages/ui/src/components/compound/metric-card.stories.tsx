import type { Meta, StoryObj } from "@storybook/react-vite";

import { textControl } from "../../storybook/controls";
import { MetricCard } from "./metric-card";

const meta = {
  title: "Patterns/DataDisplay/MetricCard",
  component: MetricCard,
  tags: ["autodocs"],
  argTypes: {
    label: textControl("Label describing the metric", "Revenue"),
    value: textControl("Primary metric value", "$42,900"),
    change: textControl("Secondary change/context line", "+12% vs. last month"),
  },
} satisfies Meta<typeof MetricCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Revenue",
    value: "$42,900",
    change: "+12% vs. last month",
  },
};

export const NoChange: Story = {
  args: {
    label: "Active Users",
    value: "1,204",
  },
};

export const EmptyValue: Story = {
  args: {
    label: "Churn Rate",
    value: undefined,
  },
};

export const Grid: Story = {
  args: {
    label: "Revenue",
    value: "$42,900",
  },
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <MetricCard label="Revenue" value="$42,900" change="+12% vs. last month" />
      <MetricCard label="Active Users" value="1,204" change="-3% vs. last month" />
      <MetricCard label="Churn Rate" value="2.1%" />
    </div>
  ),
};
