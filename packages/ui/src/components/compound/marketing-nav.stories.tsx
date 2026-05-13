import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { MarketingNav, type MarketingNavRenderLinkArgs } from "./marketing-nav";

const meta: Meta<typeof MarketingNav> = {
  component: MarketingNav,
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

const defaultLinks = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
] as const;

/** Simple anchor renderer — mirrors a real router's <Link> component. */
function renderLink({ href, className, onClick, children }: MarketingNavRenderLinkArgs) {
  return (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  );
}

/** Adds a spacer so the page content isn't hidden behind the fixed nav. */
function PageContent({
  message = "Page content appears below the fixed nav.",
}: {
  message?: string;
}) {
  return (
    <div style={{ paddingTop: 73, padding: "calc(73px + 2rem) 2rem 2rem" }}>
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
      <MarketingNav
        brand="Acme"
        brandHref="/"
        links={defaultLinks}
        cta={{ href: "/get-started", label: "Get started", variant: "default" }}
        renderLink={renderLink}
      />
      <PageContent />
    </>
  ),
};

export const NoCta: Story = {
  render: () => (
    <>
      <MarketingNav brand="Acme" brandHref="/" links={defaultLinks} renderLink={renderLink} />
      <PageContent message="Same nav, no CTA button." />
    </>
  ),
};

export const CustomHeight: Story = {
  render: () => (
    <>
      <MarketingNav
        brand="Acme"
        brandHref="/"
        links={defaultLinks}
        cta={{ href: "/get-started", label: "Get started", variant: "outline" }}
        navHeight={60}
        renderLink={renderLink}
      />
      <PageContent message="Mobile menu offset uses navHeight=60 instead of the default 73." />
    </>
  ),
};
