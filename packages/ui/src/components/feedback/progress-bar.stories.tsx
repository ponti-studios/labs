import type { Meta, StoryObj } from "@storybook/react-vite";

import { ProgressBar } from "./progress-bar";

const meta = {
  title: "Feedback/ProgressBar",
  component: ProgressBar,
  tags: ["autodocs"],
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { progress: 60 },
  render: (args) => (
    <div className="w-64">
      <ProgressBar {...args} />
    </div>
  ),
};

export const Empty: Story = {
  args: { progress: 0 },
  render: (args) => (
    <div className="w-64">
      <ProgressBar {...args} />
    </div>
  ),
};

export const Complete: Story = {
  args: { progress: 100 },
  render: (args) => (
    <div className="w-64">
      <ProgressBar {...args} />
    </div>
  ),
};
