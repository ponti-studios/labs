import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { CenteredState } from "./centered-state";

const meta: Meta<typeof CenteredState> = {
  component: CenteredState,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <CenteredState
      eyebrow="Welcome"
      title="You're all set"
      description="Your account has been created and is ready to use. Start by exploring the dashboard or inviting your teammates."
      actions={[{ label: "Go to dashboard", variant: "default" }]}
    />
  ),
};

export const ErrorState: Story = {
  render: () => (
    <CenteredState
      eyebrow="Error 500"
      title="Something went wrong"
      description="An unexpected error occurred on our end. Our team has been notified and is already working on a fix."
      actions={[
        { label: "Try again", variant: "default", onClick: () => {} },
        { label: "Go home", variant: "outline", href: "/" },
      ]}
    />
  ),
};

export const EmptyState: Story = {
  render: () => (
    <CenteredState
      eyebrow="No data"
      title="No results found"
      description="We couldn't find anything matching your search. Try adjusting your filters or broaden your query."
      actions={[{ label: "Clear filters", variant: "outline" }]}
    />
  ),
};

export const Minimal: Story = {
  render: () => <CenteredState title="Coming soon" />,
};
