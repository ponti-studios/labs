import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { ActionPanel } from "./action-panel";

const meta: Meta<typeof ActionPanel> = {
  component: ActionPanel,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-full max-w-4xl">
      <ActionPanel
        eyebrow="Get started"
        title="Launch your project in minutes"
        description="Everything you need to build, deploy, and scale your application is included out of the box. No configuration required to get started."
        actions={[
          { label: "Start free trial", variant: "default" },
          { label: "View documentation", variant: "outline" },
        ]}
      />
    </div>
  ),
};

export const WithSteps: Story = {
  render: () => (
    <div className="w-full max-w-4xl">
      <ActionPanel
        eyebrow="Quickstart"
        title="Up and running in three steps"
        description="Follow these steps to integrate our platform with your existing workflow."
        steps={[
          "Create an account and complete the onboarding checklist.",
          "Connect your data source via the integrations dashboard.",
          "Configure your first pipeline and deploy to production.",
        ]}
        actions={[
          { label: "Create account", variant: "default" },
          { label: "Read the docs", variant: "outline" },
        ]}
      />
    </div>
  ),
};

export const WithNote: Story = {
  render: () => (
    <div className="w-full max-w-4xl">
      <ActionPanel
        eyebrow="Upgrade plan"
        title="Unlock advanced features"
        description="Get access to priority support, unlimited team members, and advanced analytics with a Pro plan."
        note="No credit card required for the 14-day trial."
        actions={[
          { label: "Upgrade to Pro", variant: "default" },
          { label: "Compare plans", variant: "ghost" },
        ]}
      />
    </div>
  ),
};

export const ActionsOnly: Story = {
  render: () => (
    <div className="w-full max-w-4xl">
      <ActionPanel
        title="Ready to take the next step?"
        actions={[
          { label: "Get started", variant: "default" },
          { label: "Contact sales", variant: "outline" },
          { label: "Learn more", variant: "ghost" },
        ]}
      />
    </div>
  ),
};
