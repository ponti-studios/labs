import type { ReactNode } from "react";
import { NavLink } from "react-router";
import { LAYOUTS, LAYOUT_IDS, type LayoutId } from "./layouts-data";
import { cn } from "~/lib/utils";

export function LayoutShell({ layoutId, children }: { layoutId: LayoutId; children: ReactNode }) {
  const meta = LAYOUTS[layoutId];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 md:px-6">
      <header className="flex flex-col gap-6">
        <div>
          <p className="text-accent text-sm font-medium tracking-widest uppercase">
            Toy &middot; Streaming
          </p>
          <h1 className="heading-hero text-foreground mt-3 max-w-3xl">A slate that never ends.</h1>
          <p className="text-muted-foreground mt-4 max-w-2xl text-lg">
            2026's biggest films, two temperaments — ambient drift for the hero, a keyboard-friendly
            rail for browsing.
          </p>
        </div>
        <nav
          aria-label="Layout variants"
          className="border-border bg-muted/30 inline-flex w-fit gap-1 rounded-full border p-1"
        >
          {LAYOUT_IDS.map((id) => (
            <NavLink
              key={id}
              to={`/toys/layouts/${id}`}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                id === layoutId
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {LAYOUTS[id].label}
            </NavLink>
          ))}
        </nav>
      </header>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-foreground text-xl font-semibold">{meta.title}</h2>
          <p className="text-muted-foreground max-w-2xl text-sm">{meta.lede}</p>
        </div>
        {children}
        <aside className="border-border rounded-xl border px-4 py-3">
          <p className="text-muted-foreground text-sm">
            <span className="text-accent font-medium">When to use.</span> {meta.whenToUse}
          </p>
        </aside>
      </section>
    </div>
  );
}