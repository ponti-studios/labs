import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { Textarea } from "./textarea";

const meta: Meta<typeof Textarea> = {
  component: Textarea,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
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
    placeholder: "Type your message…",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: "This field is locked",
  },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = React.useState("");
    const limit = 200;
    const remaining = limit - value.length;

    return (
      <div className="flex flex-col gap-2 w-full max-w-sm">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, limit))}
          placeholder="Type your message…"
          rows={4}
        />
        <p
          className={[
            "text-xs text-right tabular-nums",
            remaining <= 20 ? "text-destructive" : "text-muted-foreground",
          ].join(" ")}
        >
          {remaining} characters remaining
        </p>
      </div>
    );
  },
};
