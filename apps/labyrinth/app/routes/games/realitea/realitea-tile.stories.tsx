import type { Meta, StoryObj } from "@storybook/react-vite";

import { RealiTeaTile, type RealiTeaTileState } from "./realitea-tile";

const meta: Meta<typeof RealiTeaTile> = {
  title: "RealiTea/Tile",
  component: RealiTeaTile,
  parameters: {
    layout: "padded",
  },
};

export default meta;

type Story = StoryObj<typeof RealiTeaTile>;

export const Empty: Story = {
  args: { state: "empty" },
};

export const Typed: Story = {
  args: { state: "typed", letter: "E" },
};

export const Absent: Story = {
  args: { state: "absent", letter: "E" },
};

export const Present: Story = {
  args: { state: "present", letter: "R" },
};

export const Correct: Story = {
  args: { state: "correct", letter: "I" },
};

export const Loading: Story = {
  args: { state: "empty", loading: true },
};

export const LoadingStaggered: Story = {
  render: () => (
    <div className="flex gap-1.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <RealiTeaTile key={i} state="empty" loading style={{ animationDelay: `${i * 100}ms` }} />
      ))}
    </div>
  ),
};

export const WithError: Story = {
  args: { state: "typed", letter: "E", hasError: true },
};

export const AllStates: Story = {
  name: "All States",
  render: () => {
    const states: { state: RealiTeaTileState; letter: string; label: string }[] = [
      { state: "empty", letter: "", label: "empty" },
      { state: "typed", letter: "E", label: "typed" },
      { state: "absent", letter: "A", label: "absent" },
      { state: "present", letter: "P", label: "present" },
      { state: "correct", letter: "C", label: "correct" },
    ];

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          {states.map(({ state, letter, label }) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <RealiTeaTile state={state} letter={letter} />
              <span className="text-muted-foreground text-[10px] tracking-wider uppercase">
                {label}
              </span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col items-center gap-1.5">
            <RealiTeaTile state="empty" loading />
            <span className="text-muted-foreground text-[10px] tracking-wider uppercase">
              loading
            </span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <RealiTeaTile state="typed" letter="E" hasError />
            <span className="text-muted-foreground text-[10px] tracking-wider uppercase">
              error
            </span>
          </div>
        </div>
      </div>
    );
  },
};

export const HydrateFallback: Story = {
  name: "HydrateFallback Grid",
  render: () => (
    <div className="bg-background rounded-xl p-8">
      <div className="w-fit space-y-1">
        {Array.from({ length: 6 }).map((_, row) => (
          <div key={row} className="flex gap-1.5">
            {Array.from({ length: 5 }).map((_, col) => (
              <RealiTeaTile
                key={col}
                state="empty"
                loading
                style={{ animationDelay: `${(row * 5 + col) * 100}ms` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  ),
};
