import type { ReactNode } from "react";
import { NavLink } from "react-router";
import { LAYOUTS, LAYOUT_IDS, MOVIE_TILES, type LayoutId } from "./layouts-data";
import { cn } from "~/lib/utils";

export function LayoutShell({ layoutId, children }: { layoutId: LayoutId; children: ReactNode }) {
  const meta = LAYOUTS[layoutId];
  const featured = layoutId === "vertical" ? MOVIE_TILES[8] : MOVIE_TILES[0];
  const featuredIndex = MOVIE_TILES.findIndex((tile) => tile.id === featured.id);

  return (
    <div className="layouts-streaming-shell">
      <section className="layouts-featured" aria-labelledby="layouts-featured-title">
        <div className="layouts-featured-content">
          <h1 id="layouts-featured-title">Slates should never end.</h1>
          <p className="layouts-featured-copy">
            A streaming interface study in motion, discovery, and the small thrill of finding what
            to watch next.
          </p>
        </div>
      </section>

      <section id="browse" className="layouts-streaming-content">
        <div className="layouts-catalog-heading">
          <div>
            <p className="layouts-eyebrow">Browse experiments</p>
            <h2>{meta.title}</h2>
          </div>
          <nav aria-label="Layout variants" className="layouts-layout-switcher">
            {LAYOUT_IDS.map((id) => (
              <NavLink
                key={id}
                to={`/toys/layouts/${id}`}
                className={cn("layouts-layout-link", id === layoutId && "is-active")}
              >
                {LAYOUTS[id].label}
              </NavLink>
            ))}
          </nav>
        </div>
        <p className="layouts-streaming-lede">{meta.lede}</p>
        {children}
        <aside className="layouts-usage-note">
          <p>
            <span>Design note</span> {meta.whenToUse}
          </p>
        </aside>
      </section>

      <footer className="layouts-streaming-footer">
        <span>LABYRINTH / TOYS</span>
        <span>
          {String(featuredIndex + 1).padStart(2, "0")} of {MOVIE_TILES.length} titles in this slate
        </span>
      </footer>
    </div>
  );
}
