import { useEffect, useRef, type CSSProperties } from "react";

import type { MosaicCell } from "../../lib/puzzle/stats";
import styles from "./streak-mosaic.module.css";

export type { MosaicCell, MosaicCellStatus } from "../../lib/puzzle/stats";

interface StreakMosaicProps {
  /** Contiguous daily cells, oldest first. */
  cells: readonly MosaicCell[];
}

// Solved-in-1 is the boldest fill; solved-in-6 is the palest. The floor is
// kept well above 0 so even the palest solved cell stays visually distinct
// from an unplayed cell instead of fading into the paper background.
function guessShade(guessCount: number): number {
  const clamped = Math.min(6, Math.max(1, guessCount));
  return 1 - (clamped - 1) * 0.11;
}

function cellStyle(cell: MosaicCell): CSSProperties | undefined {
  if (cell.status === "solved" && cell.guessCount) {
    return { "--mosaic-shade": guessShade(cell.guessCount) } as CSSProperties;
  }
  return undefined;
}

function cellLabel(cell: MosaicCell): string {
  const date = new Date(`${cell.dateKey}T12:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  switch (cell.status) {
    case "solved":
      return `${date}: solved in ${cell.guessCount}`;
    case "failed":
      return `${date}: out of guesses`;
    case "playing":
      return `${date}: in progress`;
    case "unplayed":
      return `${date}: not played`;
  }
}

export function StreakMosaic({ cells }: StreakMosaicProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // The grid is usually wider than its container (52 weeks at a legible
  // cell size), so it scrolls horizontally — default that scroll to the
  // right edge so "today" is what's on screen, not week 1.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [cells]);

  if (cells.length === 0) return null;

  // The grid flows column-major (a week per column, Sun-Sat top-to-bottom),
  // so the first real cell needs `firstDayOfWeek` empty slots ahead of it to
  // land in the right row.
  const firstDayOfWeek = new Date(`${cells[0].dateKey}T12:00:00`).getDay();
  const leadingPad = Array.from({ length: firstDayOfWeek }, () => null);

  return (
    <div className={styles.mosaic} data-testid="streak-mosaic">
      <div ref={scrollRef} className={styles.scroll}>
        <div className={styles.grid} role="img" aria-label="Your solve history, day by day">
          {leadingPad.map((_, i) => (
            <span key={`pad-${i}`} className={styles.pad} aria-hidden="true" />
          ))}
          {cells.map((cell) => (
            <span
              key={cell.dateKey}
              className={styles.cell}
              data-status={cell.status}
              style={cellStyle(cell)}
              title={cellLabel(cell)}
            />
          ))}
        </div>
      </div>
      <div className={styles.legend} aria-hidden="true">
        <span className={styles.legendLabel}>Fewer guesses</span>
        <span className={styles.cell} data-status="solved" style={{ "--mosaic-shade": 1 } as CSSProperties} />
        <span
          className={styles.cell}
          data-status="solved"
          style={{ "--mosaic-shade": 0.725 } as CSSProperties}
        />
        <span
          className={styles.cell}
          data-status="solved"
          style={{ "--mosaic-shade": 0.45 } as CSSProperties}
        />
        <span className={styles.cell} data-status="failed" />
        <span className={styles.legendLabel}>Failed</span>
      </div>
    </div>
  );
}
