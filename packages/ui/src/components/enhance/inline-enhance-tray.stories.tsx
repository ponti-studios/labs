import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { booleanControl, hiddenControl, textControl } from "../../storybook/controls";
import { InlineEnhanceTray } from "./inline-enhance-tray";

const meta = {
  title: "Patterns/Input/InlineEnhanceTray",
  component: InlineEnhanceTray,
  tags: ["autodocs"],
  argTypes: {
    instruction: textControl("Current instruction text", ""),
    isEnhancing: booleanControl("Shows the busy state and disables inputs", false),
    error: textControl("Error message shown below the tray"),
    title: textControl("Optional title"),
    subtitle: textControl("Optional subtitle"),
    placeholder: textControl("Input placeholder", "e.g. Make it more engaging"),
    confirmLabel: textControl("Confirm button label", "Enhance"),
    onInstructionChange: hiddenControl,
    onCancel: hiddenControl,
    onConfirm: hiddenControl,
    suggestions: hiddenControl,
  },
} satisfies Meta<typeof InlineEnhanceTray>;

export default meta;
type Story = StoryObj<typeof meta>;

function InlineEnhanceTrayPreview({
  instruction,
  isEnhancing = false,
  error = null,
}: {
  instruction: string;
  isEnhancing?: boolean;
  error?: string | null;
}) {
  const [value, setValue] = useState(instruction);

  return (
    <div className="w-[480px]">
      <InlineEnhanceTray
        instruction={value}
        onInstructionChange={setValue}
        onCancel={() => setValue("")}
        onConfirm={() => {}}
        isEnhancing={isEnhancing}
        error={error}
      />
    </div>
  );
}

export const Default: Story = {
  args: {
    instruction: "",
    onInstructionChange: () => {},
    onCancel: () => {},
    onConfirm: () => {},
  },
  render: (args) => <InlineEnhanceTrayPreview instruction={args.instruction} />,
};

export const WithSelectedSuggestion: Story = {
  args: {
    instruction: "Make concise",
    onInstructionChange: () => {},
    onCancel: () => {},
    onConfirm: () => {},
  },
  render: (args) => <InlineEnhanceTrayPreview instruction={args.instruction} />,
};

export const Enhancing: Story = {
  args: {
    instruction: "Make it more engaging",
    isEnhancing: true,
    onInstructionChange: () => {},
    onCancel: () => {},
    onConfirm: () => {},
  },
  render: (args) => (
    <InlineEnhanceTrayPreview instruction={args.instruction} isEnhancing={args.isEnhancing} />
  ),
};

export const WithError: Story = {
  args: {
    instruction: "Make it more engaging",
    error: "Enhancement failed. Please try again.",
    onInstructionChange: () => {},
    onCancel: () => {},
    onConfirm: () => {},
  },
  render: (args) => (
    <InlineEnhanceTrayPreview instruction={args.instruction} error={args.error} />
  ),
};
