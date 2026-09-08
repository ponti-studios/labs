import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { LAYOUTS, LAYOUT_IDS, MOVIE_TILES, type LayoutId } from "./layouts-data";
import { SegmentedControl } from "./controls";

export function LayoutShell({ layoutId, children }: { layoutId: LayoutId; children: ReactNode }) {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-foreground min-h-screen">
      <section
        className="mx-auto mt-4 flex w-full max-w-6xl items-start rounded-none px-4 py-10 sm:px-8"
        aria-labelledby="layouts-featured-title"
      >
        <div className="max-w-3xl">
          <h1
            id="layouts-featured-title"
            className="text-foreground m-0 max-w-3xl font-serif text-5xl leading-[0.9] font-semibold tracking-[-0.06em] sm:text-7xl"
          >
            Slates should never end.
          </h1>
          <p className="text-muted-foreground mt-5 max-w-xl text-xs leading-relaxed">
            A study into finding what to watch.
          </p>
        </div>
      </section>

      <section
        id="browse"
        className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-10 sm:px-8 sm:py-14"
      >
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <SegmentedControl
            label="Layout"
            value={layoutId}
            options={LAYOUT_IDS.map((id) => ({ value: id, label: LAYOUTS[id].label }))}
            onChange={(id) => navigate(`/toys/layouts/${id}`)}
            layoutId="layout-variant-pill"
          />
        </div>
        {children}
      </section>

      <footer className="text-muted-foreground mx-auto flex w-full max-w-6xl justify-between gap-4 px-4 py-4 text-[10px] tracking-[0.12em] uppercase sm:px-8 sm:pb-8">
        <span>LABYRINTH / TOYS</span>
        <span>{MOVIE_TILES.length} titles in this slate</span>
      </footer>
    </div>
  );
}
