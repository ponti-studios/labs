import "./main.css";

/**
 * InfiniteHeader is a marquee-style hero section built from three vertically scrolling image strips.
 *
 * The key idea is that each strip renders its content twice, back-to-back:
 *
 *   [ copy A ][ copy B ]
 *
 * The CSS animation slides the strip by half of its own height. Because copy B is an exact repeat
 * of copy A, the end of the animation visually matches the beginning of the next loop.
 *
 * That gives us the looping effect:
 *
 *   start of loop        halfway point          restart
 *   0%                   -50%                  0%
 *   [ A A A ]  --->      [ B B B ]  --->       [ A A A ]
 *
 * The browser still restarts the animation, but the duplicated content hides the seam.
 *
 * Layout overview:
 *
 *   +---------------------------------------------------------+
 *   | headline + CTA                | 3 animated image strips |
 *   |                               | A / B / A directions    |
 *   +---------------------------------------------------------+
 *
 * The JSX in this file is intentionally data-driven so each strip is just a slice of a shared
 * column definition. That keeps the markup small and makes the scrolling behavior easy to reason
 * about.
 */

/**
 * Each column is a list of images with its own visual rhythm.
 *
 * The arrays do not need to be unique across columns. Their main job is to provide enough content
 * for the duplicated strip to scroll smoothly while preserving the seam-free loop.
 */
const galleryColumns = [
  [
    {
      src: "https://placehold.co/300x400/d1d5db/374151?text=Image+1",
      alt: "Gallery item 1",
      className: "h-48 md:h-64 lg:h-80",
    },
    {
      src: "https://placehold.co/300x500/9ca3af/374151?text=Image+2",
      alt: "Gallery item 2",
      className: "h-60 md:h-80 lg:h-96",
    },
    {
      src: "https://placehold.co/300x350/6b7280/ffffff?text=Image+3",
      alt: "Gallery item 3",
      className: "h-40 md:h-56 lg:h-72",
    },
    {
      src: "https://placehold.co/300x450/4b5563/ffffff?text=Image+4",
      alt: "Gallery item 4",
      className: "h-52 md:h-72 lg:h-96",
    },
  ],
  [
    {
      src: "https://placehold.co/300x400/d1d5db/374151?text=Image+5",
      alt: "Gallery item 5",
      className: "h-48 md:h-64 lg:h-80",
    },
    {
      src: "https://placehold.co/300x500/9ca3af/374151?text=Image+6",
      alt: "Gallery item 6",
      className: "h-60 md:h-80 lg:h-96",
    },
    {
      src: "https://placehold.co/300x350/6b7280/ffffff?text=Image+7",
      alt: "Gallery item 7",
      className: "h-40 md:h-56 lg:h-72",
    },
    {
      src: "https://placehold.co/300x450/4b5563/ffffff?text=Image+8",
      alt: "Gallery item 8",
      className: "h-52 md:h-72 lg:h-96",
    },
  ],
  [
    {
      src: "https://placehold.co/300x400/d1d5db/374151?text=Image+9",
      alt: "Gallery item 9",
      className: "h-48 md:h-64 lg:h-80",
    },
    {
      src: "https://placehold.co/300x500/9ca3af/374151?text=Image+10",
      alt: "Gallery item 10",
      className: "h-60 md:h-80 lg:h-96",
    },
    {
      src: "https://placehold.co/300x350/6b7280/ffffff?text=Image+11",
      alt: "Gallery item 11",
      className: "h-40 md:h-56 lg:h-72",
    },
    {
      src: "https://placehold.co/300x450/4b5563/ffffff?text=Image+12",
      alt: "Gallery item 12",
      className: "h-52 md:h-72 lg:h-96",
    },
  ],
];

type GalleryItem = {
  src: string;
  alt: string;
  className: string;
};

/**
 * Render a single animated column.
 *
 * Why the content is duplicated:
 *
 *   visible viewport
 *   +----------------------+
 *   | copy A | copy B      |
 *   +----------------------+
 *
 * The scroll animation moves the strip until copy B occupies the same visual position that copy A
 * started in. At that point the browser can restart the animation and the user does not see a jump.
 *
 * This component does not itself animate. It only provides the duplicated DOM structure that the
 * CSS keyframes operate on.
 */
function ScrollColumn({ items, direction }: { items: GalleryItem[]; direction: "up" | "down" }) {
  const animationClass = direction === "up" ? "animate-scroll-up" : "animate-scroll-down";

  return (
    <div className={`scroll-container ${animationClass}`}>
      <div className="scroll-column">
        {/**
         * Duplicate the same list twice so the scroll can wrap seamlessly.
         *
         * Visual model:
         *
         *   before scroll            after scrolling half way
         *   -----------------        ------------------------
         *   [ A1 A2 A3 A4 ]          [ B1 B2 B3 B4 ]
         *   [ B1 B2 B3 B4 ]   --->   [ A1 A2 A3 A4 ]
         *
         * The second half is not extra content. It is the invisible handoff that keeps the loop
         * from snapping when the animation restarts.
         */}
        {items.concat(items).map((item, index) => (
          <img
            key={`${item.alt}-${index}`}
            src={item.src}
            alt={item.alt}
            className={item.className}
          />
        ))}
      </div>
    </div>
  );
}

export default function InfiniteHeader() {
  return (
    <div className="rounded-lg border border-secondary">
      <header className="container mx-auto px-4 py-10 lg:py-16">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
          {/**
           * Left side: the copy and CTA.
           * Right side: three animated columns moving in alternating directions to create a richer
           * parallax-like feel.
           */}
          <div className="text-center lg:w-1/2 lg:text-left">
            <h1 className="mb-4">Showcase Your Work Beautifully</h1>
            <p className="mb-8 text-lg text-gray-600">
              Engage your visitors with a stunning visual display. Our unique scrolling gallery
              captures attention and highlights your best content.
            </p>
            <a
              href="/"
              className="inline-block rounded-lg bg-primary px-8 py-3 font-bold text-white shadow-md transition duration-300"
            >
              Get Started
            </a>
          </div>
          <div className="w-full lg:w-1/2">
            <div className="grid grid-cols-3 gap-4">
              {/**
               * Column directions alternate so the composition feels less rigid.
               * The movement is still the same underlying trick in each column:
               * translate by half the duplicated strip height, then let the animation loop.
               */}
              <ScrollColumn items={galleryColumns[0]} direction="up" />
              <ScrollColumn items={galleryColumns[1]} direction="down" />
              <ScrollColumn items={galleryColumns[2]} direction="up" />
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
