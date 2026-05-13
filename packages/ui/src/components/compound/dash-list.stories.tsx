import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { DashList, type DashListProps } from "./dash-list";

const meta: Meta<DashListProps<string>> = {
  component: DashList as React.ComponentType<DashListProps<string>>,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      "Design the component architecture",
      "Implement core business logic",
      "Write comprehensive tests",
      "Document the public API",
      "Ship to production",
    ],
  },
};

export const CustomMarker: Story = {
  args: {
    items: [
      "Instant deployment with zero downtime",
      "Automatic scaling based on traffic",
      "Built-in monitoring and alerting",
      "One-click rollback for any release",
    ],
    marker: "→",
  },
};

export const CustomRenderer: Story = {
  render: () => (
    <DashList
      items={[
        "TypeScript for end-to-end type safety",
        "React Server Components for fast initial loads",
        "Tailwind CSS for consistent styling",
        "Storybook for isolated component development",
      ]}
      renderItem={(item) => <strong className="font-semibold">{item}</strong>}
    />
  ),
};

export const WithNumbers: Story = {
  render: () => (
    <DashList
      items={[
        "Clone the repository from GitHub",
        "Install dependencies with npm install",
        "Copy .env.example to .env and fill in your values",
        "Run the development server with npm run dev",
        "Open http://localhost:3000 in your browser",
      ]}
      marker=""
      markerClassName="hidden"
      renderItem={(item, index) => (
        <span>
          <span className="mr-2 font-mono text-sm font-bold tabular-nums text-foreground">
            {index + 1}.
          </span>
          {item}
        </span>
      )}
    />
  ),
};
