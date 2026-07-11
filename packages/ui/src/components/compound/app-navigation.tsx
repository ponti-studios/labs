import { Menu } from "lucide-react";
import * as React from "react";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "../sheet";

export interface AppNavigationLink {
  href: string;
  label: string;
}

export interface AppNavigationCta {
  href: string;
  label: string;
  variant?: "default" | "outline";
}

export interface AppNavigationRenderLinkArgs {
  href: string;
  className: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export interface AppNavigationProps {
  brand?: React.ReactNode;
  brandHref?: string;
  endContent?: React.ReactNode;
  links?: AppNavigationLink[];
  cta?: AppNavigationCta;
  /** Current pathname used to highlight the active link. */
  activeHref?: string;
  navHeight?: number;
  renderLink: (args: AppNavigationRenderLinkArgs) => React.ReactNode;
}

function ctaClassName(cta: AppNavigationCta, active: boolean, mobile: boolean) {
  if (mobile) {
    return "bg-foreground text-background hover:bg-foreground/90 mt-2 flex w-full items-center justify-center rounded-xl px-4 py-3.5 text-sm font-semibold tracking-wide uppercase transition-colors";
  }

  const base = "ml-1 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase transition-colors";

  if (cta.variant === "outline") {
    return `${base} border border-border text-foreground hover:bg-accent`;
  }

  return `${base} ${
    active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
  }`;
}

function linkClassName(active: boolean, mobile: boolean) {
  if (mobile) {
    return `flex w-full items-center rounded-xl px-4 py-3.5 text-base font-semibold tracking-tight transition-colors ${
      active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`;
  }

  return `px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase transition-colors ${
    active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
  }`;
}

export function AppNavigation({
  brand,
  brandHref = "/",
  endContent,
  links,
  cta,
  activeHref,
  renderLink,
}: AppNavigationProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const closeMobile = React.useCallback(() => setMobileOpen(false), []);

  const isActive = (href: string) => {
    if (!activeHref) return false;
    if (href === activeHref) return true;
    // Nested routes (e.g. /work/123) keep the parent link active.
    return href !== "/" && activeHref.startsWith(`${href}/`);
  };

  return (
    <div className="bg-background/80 sticky top-0 z-50 flex w-full justify-center p-2 backdrop-blur-sm backdrop-saturate-150">
      <nav className="flex w-full max-w-7xl items-center justify-between py-2">
        {brand &&
          renderLink({
            href: brandHref,
            className: "shrink-0 font-semibold text-sm tracking-tight text-foreground",
            children: brand,
          })}

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 sm:flex">
          {links?.map((link) =>
            renderLink({
              href: link.href,
              className: linkClassName(isActive(link.href), false),
              children: link.label,
            }),
          )}
          {cta &&
            renderLink({
              href: cta.href,
              className: ctaClassName(cta, isActive(cta.href), false),
              children: cta.label,
            })}
          {endContent}
        </div>

        {/* Mobile nav: brand + hamburger only, everything else lives in the sheet */}
        <div className="flex items-center gap-2 sm:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                className="border-border bg-background text-foreground inline-flex size-9 shrink-0 items-center justify-center rounded-full border"
              >
                <Menu className="size-4" aria-hidden="true" />
              </button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>

              <div className="mt-10 flex flex-1 flex-col gap-1">
                {links?.map((link) =>
                  renderLink({
                    href: link.href,
                    className: linkClassName(isActive(link.href), true),
                    children: link.label,
                    onClick: closeMobile,
                  }),
                )}
              </div>

              {(cta || endContent) && (
                <div className="border-border flex flex-col gap-4 border-t pt-4">
                  {cta &&
                    renderLink({
                      href: cta.href,
                      className: ctaClassName(cta, isActive(cta.href), true),
                      children: cta.label,
                      onClick: closeMobile,
                    })}
                  {endContent && <div className="flex items-center gap-3">{endContent}</div>}
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </div>
  );
}
