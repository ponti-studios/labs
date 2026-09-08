import { Button } from "@ponti-studios/ui/primitives";
import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { MOVIE_TILES, type MovieTile } from "./layouts-data";
import { ControlSection, SegmentedControl, SliderControl, ToggleControl } from "./controls";

const COPIES = 4;
const EASE_OUT = [0, 0, 0.2, 1] as const;

function CarouselCard({ tile }: { tile: MovieTile }) {
  return (
    <figure className="layouts-card">
      <div className="layouts-card-face">
        <img
          src={tile.logo}
          alt="Poster artwork"
          width={260}
          height={385}
          loading="lazy"
          decoding="async"
        />
      </div>
    </figure>
  );
}

export function HorizontalCarousel() {
  const reduceMotion = useReducedMotion();
  const [autoplay, setAutoplay] = useState(true);
  const [beat, setBeat] = useState(2.2);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [active, setActive] = useState(0);
  const total = MOVIE_TILES.length;

  const x = useMotionValue(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef(0);
  const globalRef = useRef(total);

  useLayoutEffect(() => {
    const measure = () => {
      const card = trackRef.current?.querySelector<HTMLElement>(".layouts-carousel-card");
      if (!card) return;
      stepRef.current = card.getBoundingClientRect().width + 16;
      x.set(-globalRef.current * stepRef.current);
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (trackRef.current) observer.observe(trackRef.current);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [x]);

  // The track renders COPIES identical full lists, so the middle copies give
  // both directions a runway of at least one full list before an invisible
  // teleport is needed to wrap around.
  const stepBy = useCallback(
    (delta: number, options?: { instant?: boolean }) => {
      const n = total;
      const s = stepRef.current;
      const min = n;
      const max = 3 * n - 1;
      const next = globalRef.current + delta;

      if (next < min || next > max) {
        const wrapped = next < min ? next + n : next - n;
        globalRef.current = wrapped;
        x.set(-wrapped * s);
        setActive(wrapped % n);
        return;
      }

      globalRef.current = next;
      setActive(next % n);
      const target = -next * s;
      if (reduceMotion || options?.instant) {
        x.set(target);
      } else {
        animate(x, target, { duration: 0.45, ease: EASE_OUT });
      }
    },
    [total, reduceMotion, x],
  );

  const autoplayRef = useRef(stepBy);
  autoplayRef.current = stepBy;

  useEffect(() => {
    if (reduceMotion || !autoplay) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      timer = setTimeout(() => {
        if (cancelled) return;
        autoplayRef.current(direction === "forward" ? 1 : -1);
        tick();
      }, beat * 1000);
    };
    tick();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [autoplay, beat, direction, reduceMotion]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      stepBy(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      stepBy(-1);
    }
  }

  const goToSlide = (index: number) => {
    stepBy(index - (globalRef.current % total), { instant: reduceMotion ?? false });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="layouts-stage">
        <div
          role="group"
          aria-roledescription="carousel"
          aria-label="2026 movie slate"
          tabIndex={0}
          className="layouts-carousel-viewport focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          onKeyDown={handleKeyDown}
        >
          <motion.div ref={trackRef} className="layouts-carousel-track" style={{ x }}>
            {Array.from({ length: COPIES }).map((_, copy) => (
              <div key={copy} className="flex gap-4" aria-hidden="true">
                {MOVIE_TILES.map((tile) => (
                  <div key={`${copy}-${tile.id}`} className="layouts-carousel-card">
                    <CarouselCard tile={tile} />
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="sr-only" aria-live="polite">
        {MOVIE_TILES[active]?.name ?? "Current item"}, item {active + 1} of {total}
      </div>

      <div className="layouts-carousel-dots">
        {MOVIE_TILES.map((tile, index) => (
          <button
            key={tile.id}
            type="button"
            aria-label={`Go to item ${index + 1}`}
            onClick={() => goToSlide(index)}
            className="layouts-carousel-dot"
            data-active={index === active}
          />
        ))}
      </div>

      <div className="flex items-center justify-center gap-3">
        <Button type="button" variant="outline" onClick={() => stepBy(-1)}>
          Previous
        </Button>
        <Button type="button" variant="outline" onClick={() => stepBy(1)}>
          Next
        </Button>
      </div>

      <ControlSection label="Motion">
        <ToggleControl
          label="Autoplay"
          checked={autoplay}
          onLabel="On"
          offLabel="Off"
          onChange={setAutoplay}
        />
        <SliderControl
          label="Beat"
          value={beat}
          min={1.2}
          max={4}
          step={0.1}
          display={`${beat.toFixed(1)}s / card`}
          onChange={setBeat}
        />
        <SegmentedControl
          label="Direction"
          value={direction}
          options={[
            { value: "forward", label: "Forward" },
            { value: "backward", label: "Backward" },
          ]}
          onChange={setDirection}
        />
      </ControlSection>
    </div>
  );
}
