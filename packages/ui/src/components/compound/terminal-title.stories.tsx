import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { TerminalTitle, type TerminalTitleProps } from "./terminal-title";

const meta: Meta<typeof TerminalTitle> = {
  component: TerminalTitle,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    title: { control: "text" },
    typingDelayMs: {
      control: { type: "range", min: 10, max: 200 },
    },
    blinkIntervalMs: {
      control: { type: "number" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Shared wrapper — gives the hero component a dark full-bleed canvas.
// ---------------------------------------------------------------------------

function HeroCanvas({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        padding: "4rem 3rem",
        background: "var(--background, #0a0a0a)",
      }}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const Default: Story = {
  args: {
    title: "Hello, World.",
  },
  render: (args) => (
    <HeroCanvas>
      <TerminalTitle {...(args as TerminalTitleProps)} />
    </HeroCanvas>
  ),
};

export const FastTyping: Story = {
  args: {
    title: "Blazing fast.",
    typingDelayMs: 10,
  },
  render: (args) => (
    <HeroCanvas>
      <TerminalTitle {...(args as TerminalTitleProps)} />
    </HeroCanvas>
  ),
};

export const CustomTaglines: Story = {
  args: {
    title: "Build something great.",
    taglines: ["For teams.", "For creators.", "For you."],
  },
  render: (args) => (
    <HeroCanvas>
      <TerminalTitle {...(args as TerminalTitleProps)} />
    </HeroCanvas>
  ),
};

/**
 * Demonstrates custom colour overrides on the title and tagline via
 * `titleClassName` and `taglineClassName`.
 */
export const CustomStyles: Story = {
  args: {
    title: "Styled to Perfection.",
    taglines: ["Colours that pop.", "Typography that leads.", "Design that ships."],
    titleClassName: "text-sky-400",
    taglineClassName: "text-emerald-400",
  },
  render: (args) => (
    <HeroCanvas>
      <TerminalTitle {...(args as TerminalTitleProps)} />
    </HeroCanvas>
  ),
};
