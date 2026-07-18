import type { Meta, StoryObj } from "@storybook/react-vite";

import { UpdateGuard } from "./update-guard";

const meta = {
  title: "Feedback/UpdateGuard",
  component: UpdateGuard,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Registers a service worker at `serviceWorkerPath` and surfaces offline/update-available prompts. In Storybook there is no service worker to register against, so the prompts stay hidden — this story documents the wrapper's pass-through behavior for `children`.",
      },
    },
  },
} satisfies Meta<typeof UpdateGuard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    hideInDev: false,
    children: (
      <div className="border-border bg-surface text-muted-foreground rounded-md border p-6 text-sm">
        App content renders here. Offline/update prompts appear fixed to the bottom of the viewport
        when the service worker reports a change.
      </div>
    ),
  },
};
