import { useReducedMotion } from "framer-motion";
import { useState } from "react";
import { MOVIE_TILES, type MovieTile } from "./layouts-data";
import { ControlSection, SegmentedControl, SliderControl } from "./controls";
import { cn } from "~/lib/utils";

const RATIO_CYCLE = ["aspect-[2/3]"] as const;

function MarqueeCard({ tile, index }: { tile: MovieTile; index: number }) {
  return (
    <figure className="layouts-card">
      <div className={cn("layouts-card-face", RATIO_CYCLE[index % RATIO_CYCLE.length])}>
        <img
          src={tile.logo}
          alt={`${tile.name} poster`}
          width={260}
          height={385}
          loading="lazy"
          decoding="async"
        />
      </div>
      <figcaption>
        <span className="layouts-card-name">{tile.name}</span>
        <span className="layouts-card-category">{tile.category}</span>
      </figcaption>
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

export function VerticalMarquee() {
  const reduceMotion = useReducedMotion();
  const [speed, setSpeed] = useState(22);
  const [gap, setGap] = useState(1);
  const [direction, setDirection] = useState<"up" | "down">("up");

  const columns = buildColumns(direction);

  return (
    <div className="flex flex-col gap-6">
      {reduceMotion ? (
        <div className="layouts-stage">
          <StaticWall />
        </div>
      ) : (
        <div className="layouts-stage">
          <div className="layouts-marquee-columns">
            {columns.map((column, columnIndex) => (
              <div
                key={columnIndex}
                className="layouts-marquee"
                style={{ "--layouts-gap": `${gap}rem` } as React.CSSProperties}
              >
                <div
                  className="layouts-marquee-track"
                  data-direction={column.direction}
                  style={{ animationDuration: `${speed * column.speedMod}s` }}
                >
                  {[0, 1].map((copy) => (
                    <div
                      key={copy}
                      className="layouts-marquee-group"
                      style={{ gap: `${gap}rem`, paddingBottom: `${gap}rem` }}
                    >
                      {column.tiles.map((tile, index) => (
                        <MarqueeCard key={`${copy}-${tile.id}`} tile={tile} index={index} />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
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