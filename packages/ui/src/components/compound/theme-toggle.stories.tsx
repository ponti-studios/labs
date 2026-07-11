import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { hiddenControl, selectControl } from "../../storybook/controls";
import { ThemeToggle, type ThemeToggleMode } from "./theme-toggle";

const meta = {
  title: "Patterns/Navigation/ThemeToggle",
  component: ThemeToggle,
  tags: ["autodocs"],
  argTypes: {
    mode: selectControl<ThemeToggleMode>(["light", "dark"], "Active theme mode", {
      defaultValue: "light",
    }),
    onModeChange: hiddenControl,
  },
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

function ThemeTogglePreview({ mode }: { mode: ThemeToggleMode }) {
  const [currentMode, setCurrentMode] = useState(mode);

  return <ThemeToggle mode={currentMode} onModeChange={setCurrentMode} />;
}

export const Default: Story = {
  args: {
    mode: "light",
    onModeChange: () => {},
  },
  render: (args) => <ThemeTogglePreview mode={args.mode} />,
};

export const Dark: Story = {
  args: {
    mode: "dark",
    onModeChange: () => {},
  },
  render: (args) => <ThemeTogglePreview mode={args.mode} />,
};
