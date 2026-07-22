import { Menu } from "lucide-react";
import * as React from "react";

import { Button } from "../primitives/button";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "../overlays/sheet";

export interface AppNavigationLink {
  href: string;
  label: string;
}

export interface AppNavigationCta {
  href: string;
  label: string;
  variant?: "default" | "outline";
}

export interface AppNavigationProps {
  brand?: React.ReactNode;
  brandHref?: string;
  endContent?: React.ReactNode;
  links?: AppNavigationLink[];
  cta?: AppNavigationCta;
  ariaLabel?: string;
  /** Current pathname used to highlight the active link. */
  activeHref?: string;
  /** A router link component. Native anchors are used when omitted. */
  linkComponent?: React.ElementType;
  /** The prop used by the link component for its destination. */
  linkProp?: "href" | "to";
  /** Props shared by every link, such as a router's prefetch hint. */
  linkProps?: Record<string, unknown>;
}

export function AppNavigation({
  brand,
  brandHref = "/",
  endContent,
  links,
  cta,
  ariaLabel = "Primary navigation",
  activeHref,
  linkComponent: LinkComponent = "a",
  linkProp = "href",
  linkProps,
}: AppNavigationProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const isActive = (href: string) => {
    if (!activeHref) return false;
    if (href === activeHref) return true;
    // Nested routes (e.g. /work/123) keep the parent link active.
    return href !== "/" && activeHref.startsWith(`${href}/`);
  };

  const createLink = ({
    href,
    children,
    active = false,
    variant,
    brand = false,
  }: {
    href: string;
    children: React.ReactNode;
    active?: boolean;
    variant?: AppNavigationCta["variant"];
    brand?: boolean;
  }) =>
    React.createElement(
      LinkComponent,
      {
        ...linkProps,
        ...(linkProp === "to" ? { to: href } : { href }),
        className: brand
          ? "inline-flex min-h-11 shrink-0 items-center rounded-md px-3 py-2 text-sm font-medium"
          : variant
            ? "inline-flex min-h-11 shrink-0 items-center justify-center rounded-md px-3 py-2 text-sm font-medium"
            : "inline-flex min-h-11 shrink-0 items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
        "aria-current": active ? "page" : undefined,
        "data-variant": variant,
      },
      children,
    );

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 flex w-full justify-center border-b px-4 backdrop-blur">
      <nav className="w-full max-w-7xl" aria-label={ariaLabel}>
        <div className="flex min-h-14 items-center justify-between gap-6">
          <div className="flex min-w-0 items-center">
            {brand && createLink({ href: brandHref, children: brand, brand: true })}
          </div>

          <div className="ml-auto hidden min-w-0 items-center gap-1 sm:flex">
            {links?.map((link) => (
              <React.Fragment key={link.href}>
                {createLink({ href: link.href, children: link.label, active: isActive(link.href) })}
              </React.Fragment>
            ))}
            {cta &&
              createLink({
                href: cta.href,
                children: cta.label,
                variant: cta.variant ?? "default",
              })}
            {endContent}
          </div>

          <div className="ml-auto flex items-center sm:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={mobileOpen ? "Close menu" : "Open menu"}
                >
                  <Menu className="size-4" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetTitle className="sr-only">Navigation menu</SheetTitle>

                <div className="mt-8 flex flex-1 flex-col gap-1">
                  {links?.map((link) => (
                    <SheetClose asChild key={link.href}>
                      {createLink({
                        href: link.href,
                        children: link.label,
                        active: isActive(link.href),
                      })}
                    </SheetClose>
                  ))}
                </div>

                {(cta || endContent) && (
                  <div className="flex flex-col gap-4 border-t pt-4">
                    {cta && (
                      <SheetClose asChild>
                        {createLink({
                          href: cta.href,
                          children: cta.label,
                          variant: cta.variant ?? "default",
                        })}
                      </SheetClose>
                    )}
                    {endContent && <div className="flex items-center gap-3">{endContent}</div>}
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}
