import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { ArrowUpRight, Menu, X } from "lucide-react";

export type StorefrontNavItem = {
  href: string;
  label: string;
  active?: boolean;
};

type StorefrontHeaderProps = {
  brandHref: string;
  navItems: StorefrontNavItem[];
  ctaHref: string;
  ctaLabel: string;
};

function NavLink({ item, onNavigate }: { item: StorefrontNavItem; onNavigate?: () => void }) {
  const sharedProps = {
    "aria-current": item.active ? ("page" as const) : undefined,
    onClick: onNavigate,
  };

  if (item.href.startsWith("#")) {
    return (
      <a href={item.href} {...sharedProps}>
        {item.label}
      </a>
    );
  }

  return (
    <Link to={item.href} prefetch="intent" {...sharedProps}>
      {item.label}
    </Link>
  );
}

export function StorefrontHeader({
  brandHref,
  navItems,
  ctaHref,
  ctaLabel,
}: StorefrontHeaderProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mobileNavOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimeout = window.setTimeout(() => closeButtonRef.current?.focus(), 50);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMobileNavOpen(false);
        menuButtonRef.current?.focus();
        return;
      }

      if (event.key !== "Tab" || !mobilePanelRef.current) return;
      const focusable = mobilePanelRef.current.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled])",
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimeout);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileNavOpen]);

  const closeMobileNav = () => {
    setMobileNavOpen(false);
    menuButtonRef.current?.focus();
  };

  return (
    <header className="storefront-header">
      <div className="storefront-header-inner">
        <Link to={brandHref} className="storefront-brand">
          <img src="/logo.ponti.png" alt="" aria-hidden="true" className="storefront-brand-mark" />
          <span>Ponti Studios</span>
        </Link>

        <nav aria-label="Main" className="storefront-nav">
          {navItems.map((item) => (
            <NavLink key={item.label} item={item} />
          ))}
        </nav>

        <a href={ctaHref} className="storefront-nav-cta">
          {ctaLabel} <ArrowUpRight aria-hidden="true" className="storefront-nav-cta-icon" />
        </a>

        <button
          ref={menuButtonRef}
          type="button"
          className="storefront-mobile-menu-button"
          aria-label="Open navigation"
          aria-expanded={mobileNavOpen}
          aria-controls="storefront-mobile-navigation"
          onClick={() => setMobileNavOpen(true)}
        >
          <Menu aria-hidden="true" />
        </button>
      </div>

      <div
        ref={mobilePanelRef}
        id="storefront-mobile-navigation"
        className="storefront-mobile-panel"
        data-open={mobileNavOpen}
        aria-hidden={!mobileNavOpen}
        aria-label="Site navigation"
        role="dialog"
        aria-modal="true"
      >
        <div className="storefront-mobile-panel-head">
          <Link to={brandHref} className="storefront-brand" onClick={closeMobileNav}>
            <img
              src="/logo.ponti.png"
              alt=""
              aria-hidden="true"
              className="storefront-brand-mark"
            />
            <span>Ponti Studios</span>
          </Link>
          <button
            ref={closeButtonRef}
            type="button"
            className="storefront-mobile-close"
            aria-label="Close navigation"
            onClick={closeMobileNav}
          >
            <X aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="Main" className="storefront-mobile-links">
          {navItems.map((item) => (
            <NavLink key={item.label} item={item} onNavigate={closeMobileNav} />
          ))}
        </nav>
        <div className="storefront-mobile-panel-foot">
          <p>Independent studio. Clear thinking, useful systems, no unnecessary noise.</p>
          <a href={ctaHref} className="storefront-mobile-cta" onClick={closeMobileNav}>
            {ctaLabel} <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
      </div>
    </header>
  );
}
