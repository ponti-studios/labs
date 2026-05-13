"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import * as React from "react";

import { cn } from "../../lib/utils";
import { buttonVariants, type ButtonProps } from "../ui/button";

export interface MarketingNavLink {
  href: string;
  label: React.ReactNode;
}

export interface MarketingNavRenderLinkArgs {
  href: string;
  className: string;
  onClick?: () => void;
  children: React.ReactNode;
}

export interface MarketingNavProps extends React.ComponentProps<"nav"> {
  brand: React.ReactNode;
  brandHref?: string;
  links: readonly MarketingNavLink[];
  cta?: MarketingNavLink & { variant?: ButtonProps["variant"] };
  openLabel?: string;
  closeLabel?: string;
  navHeight?: number;
  renderLink?: (args: MarketingNavRenderLinkArgs) => React.ReactNode;
}

export function MarketingNav({
  brand,
  brandHref = "/",
  links,
  cta,
  openLabel = "Open menu",
  closeLabel = "Close menu",
  navHeight = 73,
  renderLink,
  className,
  ...props
}: MarketingNavProps) {
  const [open, setOpen] = React.useState(false);
  const close = () => setOpen(false);

  const renderLinkElement = ({
    href,
    className,
    children,
  }: Omit<MarketingNavRenderLinkArgs, "onClick">) =>
    renderLink ? (
      renderLink({ href, className, onClick: close, children })
    ) : (
      <a href={href} className={className} onClick={close}>
        {children}
      </a>
    );

  const navLinks = cta ? [...links, cta] : links;

  return (
    <>
      <nav
        className={cn(
          "fixed left-0 right-0 top-0 z-50 border-b border-border/80 backdrop-blur-sm",
          className,
        )}
        {...props}
      >
        <div className="container flex items-center justify-between py-4">
          {renderLinkElement({
            href: brandHref,
            className: "group flex items-center gap-3",
            children: <span className="text-lg font-bold uppercase tracking-tight">{brand}</span>,
          })}

          <div className="hidden items-center gap-8 text-sm font-medium md:flex">
            {links.map((link) => (
              <React.Fragment key={link.href}>
                {renderLinkElement({
                  href: link.href,
                  className: "transition-opacity hover:opacity-60",
                  children: link.label,
                })}
              </React.Fragment>
            ))}
            {cta &&
              renderLinkElement({
                href: cta.href,
                className: buttonVariants({
                  variant: cta.variant ?? "outline",
                  className: "uppercase tracking-wider",
                }),
                children: cta.label,
              })}
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center text-foreground md:hidden"
            aria-label={open ? closeLabel : openLabel}
          >
            <motion.span
              animate={{ rotate: open ? 45 : 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="leading-none"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </motion.span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ top: navHeight }}
            className="fixed inset-x-0 bottom-0 z-40 overflow-y-auto border-b border-border md:hidden"
          >
            <div className="container py-8">
              <div className="flex flex-col gap-3">
                {navLinks.map((link) => (
                  <React.Fragment key={link.href}>
                    {renderLinkElement({
                      href: link.href,
                      className:
                        "text-sm font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground",
                      children: link.label,
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
