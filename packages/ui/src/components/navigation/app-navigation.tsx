import { Menu } from "lucide-react";
import * as React from "react";

import { cn } from "../../lib/utils";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "../overlays/sheet";

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
  renderLink: (args: AppNavigationRenderLinkArgs) => React.ReactNode;
}

function ctaClassName(cta: AppNavigationCta, active: boolean, mobile: boolean) {
  if (mobile) {
    return cn(
      "mt-2 flex min-h-11 w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
      "",
      cta.variant === "outline"
        ? "border-default text-primary hover:bg-accent bg-transparent"
        : "bg-accent text-on-accent hover:bg-accent/90",
    );
  }

  const base = "ml-2 inline-flex min-h-9 items-center rounded-md px-3 text-sm font-medium";

  if (cta.variant === "outline") {
    return cn(base, "border-default text-primary hover:bg-accent bg-transparent");
  }

  return cn(base, "bg-accent text-on-accent hover:bg-accent/90", active && "ring-focus ring-1");
}

function linkClassName(active: boolean, mobile: boolean) {
  return cn(
    mobile
      ? "flex min-h-11 w-full items-center rounded-md px-3 text-base"
      : "inline-flex min-h-9 items-center rounded-md px-3 text-sm",
    "text-secondary font-medium transition-colors",
    active && "bg-inset text-primary",
    "hover:bg-accent hover:text-primary focus-visible:bg-accent focus-visible:text-primary",
  );
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
    <div className="bg-canvas/80 border-subtle sticky top-0 z-50 flex w-full justify-center border-b px-4 backdrop-blur-sm backdrop-saturate-150">
      <nav className="flex min-h-14 w-full max-w-7xl items-center justify-between gap-6">
        {brand &&
          renderLink({
            href: brandHref,
            className: "shrink-0 text-sm font-semibold tracking-tight text-primary",
            children: brand,
          })}

        {/* Desktop nav */}
        <div className="hidden min-w-0 items-center gap-1 sm:flex">
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
                className="border-default bg-canvas text-primary hover:bg-accent inline-flex size-11 shrink-0 items-center justify-center rounded-md border transition-colors"
              >
                <Menu className="size-4" aria-hidden="true" />
              </button>
            </SheetTrigger>
            <SheetContent>
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>

              <div className="mt-8 flex flex-1 flex-col gap-1">
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
                <div className="border-default flex flex-col gap-4 border-t pt-4">
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
