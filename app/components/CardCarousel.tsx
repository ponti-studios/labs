import { type ReactNode } from "react";

type CardCarouselProps<T> = {
  items: readonly T[];
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  ariaLabel: string;
};

/** Horizontally scrollable, snap-scrolling row of cards. Generic over card content. */
export function CardCarousel<T>({ items, getKey, renderItem, ariaLabel }: CardCarouselProps<T>) {
  return (
    <ul
      aria-label={ariaLabel}
      // Cards can grow on hover and carry a shadow-lg drop shadow, both of which
      // paint outside the card's own layout box. Since this list clips on both
      // axes (overflow-x-auto forces overflow-y to auto per the CSS spec),
      // anything painted past the box gets cropped unless the list has room to
      // paint into.
      //
      // Worst case is the largest card (sm+: 340x214px):
      //   - shadow-lg is two layers; the dominant one is `0 10px 15px -3px black/20`
      //     (offset 10, blur 15, spread -3), which alone paints ~22px below the box
      //     (10 offset - 3 spread + 15 blur) and ~2px above it. This is present at
      //     rest, not just on hover.
      //   - hover adds translateY -6 (shifts everything, including the shadow, up
      //     6px) and scale 1.015 (grows the box ~1.6px per side vertically, ~2.6px
      //     per side horizontally) plus the shadow's own ~12px horizontal bleed
      //     (10 - 3 spread + 15 blur... offset-x is 0, so symmetric).
      //   - top: max(rest shadow ~2px, hover 6 translate + 1.6 scale + 2 shadow) ≈ 10px
      //   - bottom: max(rest shadow ~22px, hover 22 - 6 + ~1.6) ≈ 22px — the rest
      //     case dominates because translateY only offsets the shadow while hovering
      //   - left/right: ~12px shadow bleed + ~3px scale growth ≈ 15px
      //
      // pt-3/px-4 supply that room with margin to spare; pb-6 covers the bottom
      // shadow. Negative top/horizontal margins keep the row's visible position
      // unchanged so surrounding layout (heading gap, page margins) doesn't shift;
      // the bottom padding is left uncompensated since a little extra breathing
      // room before the next section's border is fine.
      className="-mx-4 -mt-3 flex snap-x snap-mandatory scrollbar-thin gap-6 overflow-x-auto px-4 pt-3 pb-6"
    >
      {items.map((item) => (
        <li key={getKey(item)} className="shrink-0">
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
}
