import { useReducedMotion } from "framer-motion";
import {
  memo,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEventHandler,
  type PointerEventHandler,
} from "react";
import { cn } from "~/lib/utils";
import { ControlSection, SegmentedControl, SliderControl } from "./controls";
import { MOVIE_TILES, type MovieTile } from "./layouts-data";

const RATIO_CYCLE = ["aspect-[2/3]"] as const;

function MarqueeCard({
  tile,
  index,
  onPointerEnter,
  onPointerLeave,
  onClick,
}: {
  tile: MovieTile;
  index: number;
  onPointerEnter?: PointerEventHandler<HTMLElement>;
  onPointerLeave?: PointerEventHandler<HTMLElement>;
  onClick?: MouseEventHandler<HTMLElement>;
}) {
  return (
    <figure
      className="m-0 cursor-pointer"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onClick={onClick}
    >
      <div
        className={cn(
          "relative flex aspect-[2/3] items-center justify-center overflow-hidden rounded-[0.9rem] bg-muted/20",
          RATIO_CYCLE[index % RATIO_CYCLE.length],
        )}
      >
        <img
          className="h-full w-full rounded-[0.9rem] object-contain"
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

type Column = { tiles: MovieTile[]; direction: "up" | "down"; speedMod: number };

function buildColumns(direction: "up" | "down"): Column[] {
  const byIndex = (start: number) => MOVIE_TILES.filter((_, i) => i % 3 === start);
  return [
    { tiles: byIndex(0), direction, speedMod: 1 },
    { tiles: byIndex(1), direction: direction === "up" ? "down" : "up", speedMod: 1.18 },
    { tiles: byIndex(2), direction, speedMod: 1.32 },
  ];
}

function StaticWall() {
  return (
    <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4">
      {MOVIE_TILES.map((tile) => (
        <MarqueeCard key={tile.id} tile={tile} index={0} />
      ))}
    </div>
  );
}

function MarqueeColumn({
  column,
  onPointerEnter,
  onPointerLeave,
  onClick,
}: {
  column: Column;
  onPointerEnter?: PointerEventHandler<HTMLElement>;
  onPointerLeave?: PointerEventHandler<HTMLElement>;
  onClick?: MouseEventHandler<HTMLElement>;
}) {
  return (
    <div className="relative h-[min(72svh,34rem)] overflow-hidden px-4 [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] md:h-[clamp(24rem,60vh,34rem)]">
      <div
        className="layouts-marquee-track flex flex-col will-change-transform"
        data-direction={column.direction}
        data-speed-mod={column.speedMod}
        style={{ "--layouts-speed-mod": column.speedMod } as CSSProperties}
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex flex-col gap-[var(--layouts-gap)] pb-[var(--layouts-gap)]">
            {column.tiles.map((tile, index) => (
              <MarqueeCard
                key={`${copy}-${tile.id}`}
                tile={tile}
                index={index}
                onPointerEnter={onPointerEnter}
                onPointerLeave={onPointerLeave}
                onClick={onClick}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function VerticalMarquee() {
  const reduceMotion = useReducedMotion();
  const [speed, setSpeed] = useState(22);
  const [gap, setGap] = useState(1);
  const [direction, setDirection] = useState<"up" | "down">("up");

  return (
    <div className="flex flex-col gap-6">
      {reduceMotion ? (
        <div className="relative overflow-hidden rounded-2xl border border-border bg-muted/20">
          <StaticWall />
        </div>
      ) : (
        <div
          className="relative overflow-hidden rounded-2xl border border-border bg-muted/20"
          style={{ "--layouts-gap": `${gap}rem` } as CSSProperties}
        >
          <MarqueeStage direction={direction} speed={speed} />
        </div>
      )}

      <ControlSection label="Motion">
        <SliderControl
          label="Speed"
          value={speed}
          min={12}
          max={60}
          step={1}
          display={`${speed}s / loop`}
          onChange={setSpeed}
        />
        <SliderControl
          label="Gap"
          value={gap}
          min={0.5}
          max={2.5}
          step={0.25}
          display={`${gap.toFixed(2)}rem`}
          onChange={setGap}
        />
        <SegmentedControl
          label="Flow"
          value={direction}
          options={[
            { value: "up", label: "Up" },
            { value: "down", label: "Down" },
          ]}
          onChange={setDirection}
        />
      </ControlSection>
    </div>
  );
}

const MarqueeStage = memo(function MarqueeStage({
  direction,
  speed,
}: {
  direction: "up" | "down";
  speed: number;
}) {
  const columns = useMemo(() => buildColumns(direction), [direction]);
  const stageRef = useRef<HTMLDivElement>(null);
  const animationsRef = useRef<Animation[]>([]);
  const hoverCountRef = useRef(0);
  const tappedPauseRef = useRef(false);

  const setAnimationsPaused = useCallback((paused: boolean) => {
    animationsRef.current.forEach((animation) => (paused ? animation.pause() : animation.play()));
  }, []);

  const handlePointerEnter = useCallback(() => {
    hoverCountRef.current += 1;
    setAnimationsPaused(true);
  }, [setAnimationsPaused]);

  const handlePointerLeave = useCallback(() => {
    hoverCountRef.current = Math.max(0, hoverCountRef.current - 1);
    if (hoverCountRef.current === 0 && !tappedPauseRef.current) {
      setAnimationsPaused(false);
    }
  }, [setAnimationsPaused]);

  const handleTap = useCallback(() => {
    tappedPauseRef.current = !tappedPauseRef.current;
    setAnimationsPaused(tappedPauseRef.current);
  }, [setAnimationsPaused]);

  useLayoutEffect(() => {
    const tracks = stageRef.current?.querySelectorAll<HTMLElement>(".layouts-marquee-track");
    if (!tracks) return;

    animationsRef.current = Array.from(tracks, (track) => {
      const isDown = track.dataset.direction === "down";
      const speedMod = Number(track.dataset.speedMod ?? 1);
      return track.animate(
        isDown
          ? [{ transform: "translateY(-50%)" }, { transform: "translateY(0)" }]
          : [{ transform: "translateY(0)" }, { transform: "translateY(-50%)" }],
        {
          duration: speed * speedMod * 1000,
          iterations: Infinity,
          easing: "linear",
        },
      );
    });

    return () => {
      animationsRef.current.forEach((animation) => animation.cancel());
      animationsRef.current = [];
    };
  }, [direction]);

  useLayoutEffect(() => {
    animationsRef.current.forEach((animation, index) => {
      const track = stageRef.current?.querySelectorAll<HTMLElement>(".layouts-marquee-track")[index];
      const speedMod = Number(track?.dataset.speedMod ?? 1);
      animation.effect?.updateTiming({ duration: speed * speedMod * 1000 });
    });
  }, [speed]);

  return (
    <div ref={stageRef} className="md:grid md:grid-cols-3 md:gap-5">
      <div className="md:hidden">
        <MarqueeColumn
          column={{ tiles: MOVIE_TILES, direction, speedMod: 1 }}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          onClick={handleTap}
        />
      </div>
      <div className="hidden md:contents">
        {columns.map((column, columnIndex) => (
          <MarqueeColumn
            key={columnIndex}
            column={column}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            onClick={handleTap}
          />
        ))}
      </div>
    </div>
  );
});
