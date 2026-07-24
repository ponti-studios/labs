import { useEffect, useRef, useState, type CSSProperties } from "react";

import { cn } from "~/lib/utils";

import { getRealiteaBulbInset, getRoundedPerimeterPoints, type Point } from "./tile-geometry";

export type RealiTeaTileState = "empty" | "typed" | "absent" | "present" | "correct";

type RealiTeaTileProps = {
  state: RealiTeaTileState;
  letter?: string;
  ariaLabel?: string;
  isRevealing?: boolean;
  hasError?: boolean;
};

const DEFAULT_TILE_SIZE = 58;

function getTargetSpacing(tileSize: number): number {
  const ratio = (tileSize - 54) / (82 - 54);
  return 15 + Math.max(0, Math.min(1, ratio)) * 5;
}

function getTileGeometry(tile: HTMLElement): { width: number; height: number; radius: number } {
  const { width, height } = tile.getBoundingClientRect();
  const tileSize = width || DEFAULT_TILE_SIZE;
  const computed = getComputedStyle(tile);
  const radius = Number.parseFloat(computed.borderTopLeftRadius) || 11;
  const inset = getRealiteaBulbInset(tileSize);

  return {
    width: Math.max(0, (width || tileSize) - inset * 2),
    height: Math.max(0, (height || tileSize) - inset * 2),
    radius: Math.max(0, radius - inset),
  };
}

function getBulbStyle(point: Point): CSSProperties {
  return {
    left: `${point.x}px`,
    top: `${point.y}px`,
  };
}

export function RealiTeaTile({
  state,
  letter = "",
  ariaLabel,
  isRevealing = false,
  hasError = false,
}: RealiTeaTileProps) {
  const tileRef = useRef<HTMLDivElement>(null);
  const [bulbs, setBulbs] = useState<Point[]>([]);

  useEffect(() => {
    const tile = tileRef.current;
    if (!tile) return;

    const measure = () => {
      const geometry = getTileGeometry(tile);
      const tileSize = tile.getBoundingClientRect().width || DEFAULT_TILE_SIZE;
      setBulbs(
        getRoundedPerimeterPoints(
          geometry.width,
          geometry.height,
          geometry.radius,
          getTargetSpacing(tileSize),
        ),
      );
    };

    measure();
    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(measure);
    observer.observe(tile);
    return () => observer.disconnect();
  }, []);

  const isLit = state === "correct" || state === "present";
  return (
    <div
      ref={tileRef}
      aria-label={ariaLabel}
      className={cn(
        "realitea-tile",
        isRevealing && "realitea-tile-reveal",
        hasError && "realitea-tile-error",
      )}
      data-state={state}
    >
      <span className="realitea-tile-letter">{letter}</span>
      {isLit && (
        <span className="realitea-tile-bulbs" aria-hidden="true">
          {bulbs.map((point, index) => (
            <span
              key={`${index}-${point.x.toFixed(2)}-${point.y.toFixed(2)}`}
              className="realitea-tile-bulb"
              style={getBulbStyle(point)}
            />
          ))}
        </span>
      )}
    </div>
  );
}
