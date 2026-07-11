import type { Meta, StoryObj } from "@storybook/react-vite";

import { textControl } from "../../storybook/controls";
import { Spinner } from "./spinner";

const meta = {
  title: "Feedback/Spinner",
  component: Spinner,
  tags: ["autodocs"],
  argTypes: {
    label: textControl("Visible + accessible label; pass false to hide the text", "Loading"),
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Loading",
  },
};

export const CustomLabel: Story = {
  args: {
    label: "Fetching results…",
  },
};

export const NoLabel: Story = {
  args: {
    label: false,
  },
};
