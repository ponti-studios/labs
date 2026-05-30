import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { AccordionList, MetricAccordionList } from "./accordion-list";

const meta: Meta<typeof AccordionList> = {
  component: AccordionList,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <AccordionList
      className="w-full max-w-2xl"
      showIndex
      items={[
        {
          id: "item-1",
          title: "What is your refund policy?",
          content:
            "We offer a 30-day money-back guarantee on all purchases. If you are not satisfied, contact support and we will issue a full refund.",
        },
        {
          id: "item-2",
          title: "How do I cancel my subscription?",
          content:
            "You can cancel at any time from the billing settings page. Your access remains active until the end of the current billing period.",
        },
        {
          id: "item-3",
          title: "Do you offer enterprise plans?",
          content:
            "Yes, we offer custom enterprise plans tailored to your team's needs. Reach out to our sales team to learn more about pricing and features.",
        },
      ]}
    />
  ),
};

export const WithBadges: Story = {
  render: () => (
    <AccordionList
      className="w-full max-w-2xl"
      showIndex
      items={[
        {
          id: "item-1",
          title: "New integration available",
          badge: (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
              New
            </span>
          ),
          content:
            "We've added native support for Slack, Linear, and GitHub integrations — available in all plan tiers.",
        },
        {
          id: "item-2",
          title: "Updated billing flow",
          badge: (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
              Updated
            </span>
          ),
          content:
            "The checkout flow has been streamlined, reducing the number of steps from five to two.",
        },
        {
          id: "item-3",
          title: "Legacy API endpoints",
          badge: (
            <span className="rounded-full bg-destructive px-2 py-0.5 text-xs font-semibold text-destructive-foreground">
              Deprecated
            </span>
          ),
          content:
            "The v1 REST endpoints will be removed on January 1st. Please migrate to the v2 API before that date.",
        },
      ]}
    />
  ),
};

export const CustomRenderer: Story = {
  render: () => (
    <AccordionList
      className="w-full max-w-2xl"
      showIndex
      items={[
        { id: "item-1", title: "Design principles" },
        { id: "item-2", title: "Engineering philosophy" },
        { id: "item-3", title: "Product strategy" },
      ]}
      renderContent={(item, index) => (
        <p className="italic text-muted-foreground">
          Custom content for item {index + 1}, rendered via the{" "}
          <code className="rounded bg-muted px-1 font-mono text-xs not-italic">renderContent</code>{" "}
          prop. Override the default content display with any React node.
        </p>
      )}
    />
  ),
};

export const Metric: Story = {
  render: () => (
    <MetricAccordionList
      className="mt-0 w-full max-w-3xl"
      columns={{ item: "Metric", type: "Category", result: "Score" }}
      items={[
        {
          id: "metric-1",
          title: "Page load speed",
          badge: "Performance",
          metric: "98",
          metricLabel: "score",
          description:
            "Pages load in under 1.2 seconds on average, measured across all devices and connection types globally.",
        },
        {
          id: "metric-2",
          title: "Uptime SLA",
          badge: "Reliability",
          metric: "99.9%",
          metricLabel: "uptime",
          description:
            "Our infrastructure maintains a 99.9% uptime guarantee backed by a multi-region active-active failover architecture.",
        },
        {
          id: "metric-3",
          title: "Customer satisfaction",
          badge: "Support",
          metric: "4.9",
          metricLabel: "avg rating",
          description:
            "Customers rate our support interactions 4.9 out of 5 stars, based on over 12,000 survey responses in the last quarter.",
        },
      ]}
    />
  ),
};
