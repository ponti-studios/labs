import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../components/primitives/button";
import { colorTokenNames } from "./index";

const meta: Meta = { title: "Foundations/Colors", parameters: { layout: "fullscreen" } };
export default meta;
type Story = StoryObj<typeof meta>;

export const SystemAppearance: Story = {
  render: () => (
    <main className="bg-background text-foreground grid min-h-screen gap-8 p-6 md:p-10">
      <header className="grid gap-2">
        <h1 className="text-2xl font-semibold">System color roles</h1>
        <p className="text-muted-foreground max-w-prose text-sm">
          These semantic roles resolve from the operating system’s light or dark appearance. CSS is
          the single source of their values.
        </p>
      </header>
      <div className="flex flex-wrap gap-2">
        <Button>Primary action</Button>
        <Button variant="secondary">Secondary action</Button>
        <Button variant="outline">Outline action</Button>
        <Button variant="destructive">Delete item</Button>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {colorTokenNames.map((token) => (
          <div
            key={token}
            className="border-border grid min-h-20 content-end rounded-md border p-3"
            style={{ backgroundColor: `var(--color-${token})` }}
          >
            <span className="bg-background text-foreground w-fit rounded px-1 font-mono text-xs">
              {token}
            </span>
          </div>
        ))}
      </div>
    </main>
  ),
};
