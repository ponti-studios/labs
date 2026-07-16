import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { AppNavigation } from "./app-navigation";

const meta: Meta<typeof AppNavigation> = {
  title: "Navigation/AppNavigation",
  component: AppNavigation,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const defaultLinks: Array<{ href: string; label: string }> = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

/** Adds a little page content so the navigation can be viewed in context. */
function PageContent({
  message = "Page content appears below the sticky nav.",
}: {
  message?: string;
}) {
  return (
    <div style={{ padding: "2rem" }}>
      <p style={{ color: "var(--muted-foreground, #888)", fontSize: 14 }}>{message}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => (
    <>
      <AppNavigation
        brand="Acme"
        brandHref="/"
        links={defaultLinks}
        cta={{ href: "/get-started", label: "Get started", variant: "default" }}
      />
      <PageContent />
    </>
  ),
};

export const NoCta: Story = {
  render: () => (
    <>
      <AppNavigation brand="Acme" brandHref="/" links={defaultLinks} />
      <PageContent message="Same nav, no CTA button." />
    </>
  ),
};

export const OutlineCta: Story = {
  render: () => (
    <>
      <AppNavigation
        brand="Acme"
        brandHref="/"
        links={defaultLinks}
        cta={{ href: "/get-started", label: "Get started", variant: "outline" }}
      />
      <PageContent message="The outline CTA keeps the same navigation geometry with a quieter emphasis." />
    </>
  ),
};
