import { Button } from "@ponti-studios/ui/primitives";
import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "~/lib/utils";
import { MOVIE_TILES, type MovieTile } from "./layouts-data";
import { ControlSection, SegmentedControl, SliderControl, ToggleControl } from "./controls";

const COPIES = 4;
const EASE_OUT = [0, 0, 0.2, 1] as const;

function CarouselCard({ tile, progress = 0 }: { tile: MovieTile; progress?: number }) {
  return (
    <figure className="m-0">
      <div className="relative flex aspect-[2/3] items-center justify-center overflow-hidden rounded-[0.9rem] bg-muted/20">
        <img
          className="h-full w-full rounded-[0.9rem] object-contain transition-[transform,filter] duration-300 group-hover:scale-[1.045] group-hover:brightness-110"
          src={tile.logo}
          alt="Poster artwork"
          width={260}
          height={385}
          loading="lazy"
          decoding="async"
        />
        <div className="bg-foreground/20 absolute right-2 bottom-2 left-2 h-0.5 overflow-hidden rounded-full" aria-hidden="true">
          <span
            className="bg-foreground/80 block h-full w-full origin-left rounded-full transition-transform duration-100"
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>
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
  const [progress, setProgress] = useState(0);
  const total = MOVIE_TILES.length;

  const x = useMotionValue(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef(0);
  const centerOffsetRef = useRef(0);
  const globalRef = useRef(total);

  useEffect(() => {
    setProgress(0);
    if (!autoplay || reduceMotion) return;

    let frameId: number;
    const startedAt = performance.now();
    const update = () => {
      setProgress(Math.min(1, (performance.now() - startedAt) / (beat * 1000)));
      frameId = requestAnimationFrame(update);
    };

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [active, autoplay, beat, reduceMotion]);

  useLayoutEffect(() => {
    const measure = () => {
      const card = trackRef.current?.querySelector<HTMLElement>(".layouts-carousel-card");
      const viewport = viewportRef.current;
      if (!card || !viewport) return;
      const cardWidth = card.offsetWidth;
      stepRef.current = cardWidth + 16;
      centerOffsetRef.current = Math.max(0, (viewport.getBoundingClientRect().width - cardWidth) / 2);
      x.set(centerOffsetRef.current - globalRef.current * stepRef.current);
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
        x.set(centerOffsetRef.current - wrapped * s);
        setActive(wrapped % n);
        return;
      }

      globalRef.current = next;
      setActive(next % n);
      const target = centerOffsetRef.current - next * s;
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
      <div className="relative overflow-hidden rounded-2xl border border-border bg-muted/20">
        <div
          role="group"
          aria-roledescription="carousel"
          aria-label="2026 movie slate"
          tabIndex={0}
          ref={viewportRef}
          className="relative overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent_0%,black_6%,black_94%,transparent_100%)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          onKeyDown={handleKeyDown}
        >
          <motion.div ref={trackRef} className="flex items-stretch gap-4" style={{ x }}>
            {Array.from({ length: COPIES }).map((_, copy) => (
              <div key={copy} className="flex gap-4" aria-hidden="true">
                {MOVIE_TILES.map((tile, tileIndex) => (
                  <div
                    key={`${copy}-${tile.id}`}
                    className={cn(
                      "layouts-carousel-card group relative flex-[0_0_clamp(11rem,20vw,15rem)] opacity-60 saturate-[0.72] brightness-[0.76] transition-[opacity,filter,transform] duration-300",
                      copy * total + tileIndex === globalRef.current &&
                        "z-10 scale-[1.04] opacity-100 saturate-100 brightness-100",
                    )}
                    data-active={copy * total + tileIndex === globalRef.current}
                  >
                    <CarouselCard
                      tile={tile}
                      progress={copy * total + tileIndex === globalRef.current ? progress : 0}
                    />
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        </div>
        <Button
          type="button"
          variant="outline"
          aria-label="Previous poster"
          className="bg-background/75 text-foreground hover:bg-background absolute top-1/2 left-3 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border-border/70 p-0 shadow-lg backdrop-blur-md"
          onClick={() => stepBy(-1)}
        >
          <ChevronLeft aria-hidden="true" className="size-5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          aria-label="Next poster"
          className="bg-background/75 text-foreground hover:bg-background absolute top-1/2 right-3 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border-border/70 p-0 shadow-lg backdrop-blur-md"
          onClick={() => stepBy(1)}
        >
          <ChevronRight aria-hidden="true" className="size-5" />
        </Button>
        <div className="bg-background/70 absolute bottom-2 left-1/2 z-20 flex max-w-[calc(100%-8rem)] -translate-x-1/2 gap-2 overflow-x-auto rounded-full px-2 py-1 backdrop-blur-md">
          {MOVIE_TILES.map((tile, index) => (
            <button
              key={tile.id}
              type="button"
              aria-label={`Go to item ${index + 1}`}
              onClick={() => goToSlide(index)}
              className={cn(
                "h-2 w-2 shrink-0 rounded-full bg-muted-foreground/40 transition-[opacity,transform]",
                index === active && "scale-125 opacity-100",
              )}
            />
          ))}
        </div>
      </div>

      <div className="sr-only" aria-live="polite">
        {MOVIE_TILES[active]?.name ?? "Current item"}, item {active + 1} of {total}
      </div>

      <ControlSection label="Motion">
        <div className="border-border flex flex-wrap items-center gap-x-8 gap-y-5 rounded-xl border px-3 py-2.5">
          <ToggleControl
            label="Autoplay"
            checked={autoplay}
            onLabel="On"
            offLabel="Off"
            onChange={setAutoplay}
          />
          {autoplay && (
            <SegmentedControl
              label="Direction"
              value={direction}
              options={[
                { value: "forward", label: "Forward" },
                { value: "backward", label: "Backward" },
              ]}
              onChange={setDirection}
            />
          )}
        </div>
        <SliderControl
          label="Beat"
          value={beat}
          min={1.2}
          max={4}
          step={0.1}
          display={`${beat.toFixed(1)}s / card`}
          onChange={setBeat}
        />
      </ControlSection>
    </div>
  );
}
