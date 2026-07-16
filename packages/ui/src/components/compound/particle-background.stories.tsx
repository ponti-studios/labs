import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { ParticleBackground } from "./particle-background";

const meta: Meta<typeof ParticleBackground> = {
  title: "Motion/ParticleBackground",
  component: ParticleBackground,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    enabled: { control: "boolean" },
    interactive: { control: "boolean" },
    showGradient: { control: "boolean" },
    particleCount: {
      control: { type: "range", min: 20, max: 600, step: 10 },
      description: "Fixed particle count. Leave unset to auto-size from particleDensity.",
    },
    particleDensity: { control: { type: "number" } },
    maxLinkDistance: { control: { type: "range", min: 0, max: 300 } },
    attractRadius: { control: { type: "number" } },
    attractStrength: { control: { type: "number" } },
    velocity: {
      control: { type: "range", min: 0, max: 1, step: 0.02 },
      description: "Base particle drift speed in pixels per frame.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Shared wrapper
// ---------------------------------------------------------------------------

function Canvas({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: 600,
        height: 400,
        position: "relative",
        background: "#0f0f0f",
        overflow: "hidden",
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
  render: (args) => (
    <Canvas>
      <ParticleBackground {...args} />
    </Canvas>
  ),
};

export const Dense: Story = {
  args: {
    particleDensity: 800,
  },
  render: (args) => (
    <Canvas>
      <ParticleBackground {...args} />
    </Canvas>
  ),
};

export const NoLinks: Story = {
  args: {
    maxLinkDistance: 0,
  },
  render: (args) => (
    <Canvas>
      <ParticleBackground {...args} />
    </Canvas>
  ),
};

/**
 * When `enabled` is `false`, the component returns `null` — nothing is
 * rendered inside the container. The dark box is the wrapper only.
 */
export const Disabled: Story = {
  args: {
    enabled: false,
  },
  render: (args) => (
    <Canvas>
      <ParticleBackground {...args} />
    </Canvas>
  ),
};

/**
 * Use the `particleCount` and `velocity` controls to tune density and drift
 * speed together, alongside `maxLinkDistance` for how eagerly particles link up.
 */
export const Tuning: Story = {
  args: {
    particleCount: 160,
    velocity: 0.18,
    maxLinkDistance: 90,
  },
  render: (args) => (
    <Canvas>
      <ParticleBackground {...args} />
    </Canvas>
  ),
};

/**
 * Particles carry a `depth` value that drives size, opacity, twinkle, and
 * scroll parallax. Scroll this frame to see nearer (larger) particles drift
 * faster than farther (smaller) ones.
 */
export const Parallax: Story = {
  parameters: {
    layout: "fullscreen",
  },
  render: (args) => (
    <div style={{ height: 1600, position: "relative", background: "#0f0f0f" }}>
      <ParticleBackground {...args} style={{ position: "fixed", inset: 0 }} particleCount={220} />
      <div
        style={{
          position: "relative",
          color: "#f0f6fc",
          fontFamily: "sans-serif",
          padding: 24,
        }}
      >
        <p>Scroll down to see the parallax effect.</p>
      </div>
    </div>
  ),
};
