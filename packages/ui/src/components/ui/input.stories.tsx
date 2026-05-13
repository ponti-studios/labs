import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Input } from "./input";

const meta: Meta<typeof Input> = {
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    type: { control: "text" },
    placeholder: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithPlaceholder: Story = {
  args: {
    placeholder: "Enter email…",
    type: "email",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: "Disabled input",
  },
};

export const WithValue: Story = {
  render: () => {
    const [value, setValue] = React.useState("Controlled value");
    return (
      <div className="flex flex-col gap-2 w-full max-w-sm">
        <Input value={value} onChange={(e) => setValue(e.target.value)} />
        <p className="text-xs text-muted-foreground">{value.length} characters</p>
      </div>
    );
  },
};
