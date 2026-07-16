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
  // LV: monogram browns, canvas tan, ivory
  [
    "https://placehold.co/300x400/5C3D2E/F5ECD7?text=I",
    "https://placehold.co/300x500/C8A882/3D2010?text=II",
    "https://placehold.co/300x350/F5ECD7/5C3D2E?text=III",
    "https://placehold.co/300x450/1A1208/C8A882?text=IV",
  ],
  // Hermès: brique orange, saddle tan, rouge casaque, chocolate
  [
    "https://placehold.co/300x400/C4602A/F5ECD7?text=V",
    "https://placehold.co/300x500/3D2010/C8A882?text=VI",
    "https://placehold.co/300x350/8C1C1C/F5ECD7?text=VII",
    "https://placehold.co/300x450/A0703A/F5ECD7?text=VIII",
  ],
  // Luxury accents: Prussian blue, cypress green, noir, champagne
  [
    "https://placehold.co/300x400/2C3E55/E8D5B5?text=IX",
    "https://placehold.co/300x500/4A5C3C/E8D5B5?text=X",
    "https://placehold.co/300x350/1A1208/B8955A?text=XI",
    "https://placehold.co/300x450/B8955A/1A1208?text=XII",
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
          <img
            key={`${item.src}-${index}`}
            src={item.src}
            alt={item.alt}
            className={item.className}
          />
        ))}
      </div>
    </div>
  );
}

export default function InfiniteScroll() {
  return (
    <div className="border rounded-lg border">
      <header className="container mx-auto px-4">
        <div className="grid grid-cols-3 gap-4">
          <ScrollColumn urls={galleryColumns[0]} direction="up" />
          <ScrollColumn urls={galleryColumns[1]} direction="down" />
          <ScrollColumn urls={galleryColumns[2]} direction="up" />
        </div>
      </header>
    </div>
  );
}
