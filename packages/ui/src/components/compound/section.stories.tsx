import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { Eyebrow, PlainCard, SectionHeader, SectionHeading, SectionShell } from "./section";

// SectionHeader is the primary component for autodocs since it composes all
// the small primitives together and has the richest prop surface.
const meta: Meta<typeof SectionHeader> = {
  component: SectionHeader,
  tags: ["autodocs"],
  argTypes: {
    eyebrow: { control: "text" },
    title: { control: "text" },
    description: { control: "text" },
    titleClassName: { control: "text" },
    descriptionClassName: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// SectionHeader stories (args-driven)
// ---------------------------------------------------------------------------

export const HeaderDefault: Story = {
  args: {
    eyebrow: "Our Offering",
    title: "Built for teams that ship",
    description:
      "A complete platform that handles the heavy lifting so your team can focus on what actually matters — building great products.",
  },
};

export const HeaderNoEyebrow: Story = {
  args: {
    title: "Simple, transparent pricing",
    description:
      "No hidden fees. No surprises. Pick the plan that fits your team and upgrade whenever you're ready.",
  },
};

// ---------------------------------------------------------------------------
// Compound / render-fn stories
// ---------------------------------------------------------------------------

export const ShellWithContent: Story = {
  render: () => (
    <SectionShell>
      <SectionHeader
        eyebrow="What we offer"
        title="Everything you need to scale"
        description="A complete platform for modern teams — from analytics to automation, all in one place."
      />
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <PlainCard>
          <h3 className="font-bold">Analytics</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Deep insights into your data with real-time dashboards and customisable reports.
          </p>
        </PlainCard>
        <PlainCard>
          <h3 className="font-bold">Automation</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Streamline repetitive tasks with powerful no-code workflow automation.
          </p>
        </PlainCard>
        <PlainCard>
          <h3 className="font-bold">Collaboration</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Work together seamlessly with your entire team, wherever they are.
          </p>
        </PlainCard>
      </div>
    </SectionShell>
  ),
};

export const EyebrowOnly: Story = {
  render: () => (
    <div style={{ padding: "2rem" }}>
      <Eyebrow>Coming soon</Eyebrow>
    </div>
  ),
};

export const HeadingOnly: Story = {
  render: () => (
    <div style={{ padding: "2rem" }}>
      <SectionHeading>Our Services</SectionHeading>
    </div>
  ),
};

export const PlainCardExample: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", padding: "2rem", flexWrap: "wrap" }}>
      <PlainCard style={{ flex: "1 1 200px" }}>
        <h3 className="font-bold">Starter</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Perfect for indie developers and side projects. Up to 3 seats included.
        </p>
        <p className="mt-4 text-2xl font-bold">$0</p>
        <p className="text-xs text-muted-foreground">per month</p>
      </PlainCard>
      <PlainCard style={{ flex: "1 1 200px" }}>
        <h3 className="font-bold">Pro</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          For growing teams that need advanced features and priority support.
        </p>
        <p className="mt-4 text-2xl font-bold">$49</p>
        <p className="text-xs text-muted-foreground">per month</p>
      </PlainCard>
      <PlainCard style={{ flex: "1 1 200px" }}>
        <h3 className="font-bold">Enterprise</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Custom contracts, SSO, audit logs, and a dedicated customer success manager.
        </p>
        <p className="mt-4 text-2xl font-bold">Custom</p>
        <p className="text-xs text-muted-foreground">contact us</p>
      </PlainCard>
    </div>
  ),
};
