import { useMemo } from "react";
import "./main.css";

/**
 * InfiniteScroll is a marquee-style hero section built from three vertically scrolling image strips.
 *
 * Each strip renders its URLs twice back-to-back so the CSS animation can translate by -50% and
 * restart without a visible seam:
 *
 *   0%  [ A A A ]  →  -50%  [ B B B ]  →  restart at 0%
 *
 * Only URLs are defined here. Alt text and height classes are derived automatically inside
 * ScrollColumn and memoized so they are only computed once per column.
 */

const galleryColumns: string[][] = [
  [
    "https://placehold.co/300x400/d1d5db/374151?text=Image+1",
    "https://placehold.co/300x500/9ca3af/374151?text=Image+2",
    "https://placehold.co/300x350/6b7280/ffffff?text=Image+3",
    "https://placehold.co/300x450/4b5563/ffffff?text=Image+4",
  ],
  [
    "https://placehold.co/300x400/d1d5db/374151?text=Image+5",
    "https://placehold.co/300x500/9ca3af/374151?text=Image+6",
    "https://placehold.co/300x350/6b7280/ffffff?text=Image+7",
    "https://placehold.co/300x450/4b5563/ffffff?text=Image+8",
  ],
  [
    "https://placehold.co/300x400/d1d5db/374151?text=Image+9",
    "https://placehold.co/300x500/9ca3af/374151?text=Image+10",
    "https://placehold.co/300x350/6b7280/ffffff?text=Image+11",
    "https://placehold.co/300x450/4b5563/ffffff?text=Image+12",
  ],
];

const HEIGHTS = [
  "h-48 md:h-64 lg:h-80",
  "h-60 md:h-80 lg:h-96",
  "h-40 md:h-56 lg:h-72",
  "h-52 md:h-72 lg:h-96",
];

function ScrollColumn({ urls, direction }: { urls: string[]; direction: "up" | "down" }) {
  const animationClass = direction === "up" ? "animate-scroll-up" : "animate-scroll-down";

  // Duplicate for seamless looping; derive alt and height class by position.
  const items = useMemo(
    () =>
      urls.concat(urls).map((src, index) => ({
        src,
        alt: `Gallery image ${(index % urls.length) + 1}`,
        className: HEIGHTS[index % HEIGHTS.length],
      })),
    [urls],
  );

  return (
    <div className={`scroll-container ${animationClass}`}>
      <div className="scroll-column">
        {items.map((item, index) => (
          <img key={`${item.src}-${index}`} src={item.src} alt={item.alt} className={item.className} />
        ))}
      </div>
    </div>
  );
}

export default function InfiniteScroll() {
  return (
    <div className="rounded-lg border border-secondary">
      <header className="container mx-auto px-4 py-10 lg:py-16">
        <div className="w-full lg:w-1/2">
          <div className="grid grid-cols-3 gap-4">
            <ScrollColumn urls={galleryColumns[0]} direction="up" />
            <ScrollColumn urls={galleryColumns[1]} direction="down" />
            <ScrollColumn urls={galleryColumns[2]} direction="up" />
          </div>
        </div>
      </header>
    </div>
  );
}
