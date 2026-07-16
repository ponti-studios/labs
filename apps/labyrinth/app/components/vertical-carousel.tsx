import { cn } from "@pontistudios/ui/utilities";
import type { ReactNode } from "react";

type VerticalCarouselProps<T> = {
  items: readonly T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  ariaLabel: string;
};

export function VerticalCarousel<T>({
  items,
  keyExtractor,
  renderItem,
  ariaLabel,
}: VerticalCarouselProps<T>) {
  return (
    <ul
      aria-label={ariaLabel}
      className={cn(
        "carousel-fade-mask-y flex snap-y snap-mandatory scrollbar-thin flex-col gap-4 overflow-y-auto pr-4",
      )}
    >
      {items.map((item) => (
        <li key={keyExtractor(item)} className="shrink-0 snap-start">
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
}
