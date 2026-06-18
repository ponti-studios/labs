import * as React from "react";

export interface MarketingNavLink {
  href: string;
  label: string;
}

export interface MarketingNavCta {
  href: string;
  label: string;
  variant?: "default" | "outline";
}

export interface MarketingNavRenderLinkArgs {
  href: string;
  className: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export interface MarketingNavProps {
  brand?: string;
  brandHref?: string;
  links: MarketingNavLink[];
  cta?: MarketingNavCta;
  /** Current pathname used to highlight the active link. */
  activeHref?: string;
  navHeight?: number;
  renderLink: (args: MarketingNavRenderLinkArgs) => React.ReactNode;
}

export function MarketingNav({
  brand,
  brandHref = "/",
  links,
  cta,
  activeHref,
  renderLink,
}: MarketingNavProps) {
  const isActive = (href: string) => href === activeHref;

  return (
    <div className="fixed top-5 left-0 right-0 z-50 flex justify-center px-4">
      <nav className="w-full max-w-7xl flex items-center justify-between bg-card border border-border rounded-full px-4 py-2 shadow-sm">
        {brand &&
          renderLink({
            href: brandHref,
            className: "font-semibold text-sm tracking-tight px-2 text-foreground",
            children: brand,
          })}

        <div className="flex items-center gap-1">
          {links.map((link) =>
            renderLink({
              href: link.href,
              className: `px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase transition-colors ${
                isActive(link.href)
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`,
              children: link.label,
            }),
          )}
          {cta &&
            renderLink({
              href: cta.href,
              className: `ml-1 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase transition-colors ${
                cta.variant === "outline"
                  ? "border border-border text-foreground hover:bg-accent"
                  : isActive(cta.href)
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
              }`,
              children: cta.label,
            })}
        </div>
      </nav>
    </div>
  );
}
