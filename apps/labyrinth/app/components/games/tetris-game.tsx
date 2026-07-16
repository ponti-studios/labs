import { Button } from "@pontistudios/ui";
import type { FC } from "react";
import { memo, useCallback, useEffect, useReducer, useRef } from "react";

// Type definitions
interface Piece {
  shape: number[][];
  opacity: number;
}

type GameCell = null | number | { ghost: true; opacity: number };

interface GameState {
  grid: GameCell[][];
  current: Piece | null;
  next: Piece;
  held: Piece | null;
  canHold: boolean;
  x: number;
  y: number;
  score: number;
  lines: number;
  level: number;
  gameOver: boolean;
  paused: boolean;
  started: boolean;
}

type GameAction =
  | { type: "START" }
  | { type: "SPAWN" }
  | { type: "MOVE"; dx: number; dy: number }
  | { type: "ROTATE" }
  | { type: "DROP" }
  | { type: "LOCK" }
  | { type: "HOLD" }
  | { type: "PAUSE" };

// Constants
const COLS = 10;
const ROWS = 20;
const TICK_MS = 1000;
const LOCK_DELAY_MS = 500;
const POINTS: Record<number, number> = { 1: 100, 2: 300, 3: 500, 4: 800 };

// Opacity levels used as piece identifiers
const PIECES: Record<string, Piece> = {
  I: { shape: [[1, 1, 1, 1]], opacity: 1.0 },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    opacity: 0.9,
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    opacity: 0.85,
  },
  L: {
    shape: [
      [1, 0],
      [1, 0],
      [1, 1],
    ],
    opacity: 0.8,
  },
  J: {
    shape: [
      [0, 1],
      [0, 1],
      [1, 1],
    ],
    opacity: 0.75,
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    opacity: 0.7,
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    opacity: 0.65,
  },
};

// Map each piece's opacity to a design-system gray
function pieceColor(opacity: number): string {
  if (opacity >= 1.0) return "#f9fafb"; // I — near white
  if (opacity >= 0.9) return "#e5e7eb"; // O
  if (opacity >= 0.85) return "#d1d5db"; // T
  if (opacity >= 0.8) return "#9ca3af"; // L
  if (opacity >= 0.75) return "#6b7280"; // J
  if (opacity >= 0.7) return "#4b5563"; // S
  return "#374151"; // Z
}

// Game logic utilities
const createEmptyGrid = (): GameCell[][] =>
  Array(ROWS)
    .fill(null)
    .map(() => Array(COLS).fill(null));

const randomPiece = (): Piece => {
  const keys = Object.keys(PIECES);
  const key = keys[(Math.random() * keys.length) | 0] as keyof typeof PIECES;
  return { ...PIECES[key], shape: PIECES[key].shape };
};

const canMove = (grid: GameCell[][], piece: Piece, x: number, y: number): boolean => {
  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (piece.shape[row][col]) {
        const newY = y + row;
        const newX = x + col;
        if (newX < 0 || newX >= COLS || newY >= ROWS) return false;
        if (newY >= 0 && grid[newY][newX]) return false;
      }
    }
  }
  return true;
};

const mergePiece = (grid: GameCell[][], piece: Piece, x: number, y: number): GameCell[][] => {
  const newGrid = grid.map((row: GameCell[]) => [...row]);
  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (piece.shape[row][col]) {
        const newY = y + row;
        if (newY >= 0) newGrid[newY][x + col] = piece.opacity;
      }
    }
  }
  return newGrid;
};

const clearLines = (grid: GameCell[][]): { grid: GameCell[][]; lines: number } => {
  const newGrid: GameCell[][] = [];
  let cleared = 0;
  for (let row = ROWS - 1; row >= 0; row--) {
    if (grid[row].some((cell: GameCell) => !cell)) {
      newGrid.unshift(grid[row]);
    } else {
      cleared++;
    }
  }
  while (newGrid.length < ROWS) newGrid.unshift(Array(COLS).fill(null));
  return { grid: newGrid, lines: cleared };
};

const rotatePiece = (piece: Piece): Piece => {
  const shape = piece.shape[0].map((_: number, i: number) =>
    piece.shape.map((row: number[]) => row[i]).reverse(),
  );
  return { ...piece, shape };
};

const getDropY = (grid: GameCell[][], piece: Piece, x: number, y: number): number => {
  let dropY = y;
  while (canMove(grid, piece, x, dropY + 1)) dropY++;
  return dropY;
};

const getSpawnX = (piece: Piece): number => Math.floor((COLS - piece.shape[0].length) / 2);

const initialState: GameState = {
  grid: createEmptyGrid(),
  current: null,
  next: randomPiece(),
  held: null,
  canHold: true,
  x: 0,
  y: 0,
  score: 0,
  lines: 0,
  level: 1,
  gameOver: false,
  paused: false,
  started: false,
};

const reducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case "START": {
      const piece = state.next;
      return {
        ...initialState,
        current: piece,
        next: randomPiece(),
        x: getSpawnX(piece),
        y: 0,
        started: true,
      };
    }
    case "SPAWN": {
      const piece = state.next;
      const x = getSpawnX(piece);
      if (!canMove(state.grid, piece, x, 0)) return { ...state, gameOver: true };
      return { ...state, current: piece, next: randomPiece(), x, y: 0, canHold: true };
    }
    case "MOVE": {
      const { dx, dy } = action;
      if (!state.current || state.gameOver || state.paused) return state;
      const newX = state.x + dx;
      const newY = state.y + dy;
      if (canMove(state.grid, state.current, newX, newY)) return { ...state, x: newX, y: newY };
      return state;
    }
    case "ROTATE": {
      if (!state.current || state.gameOver || state.paused) return state;
      const rotated = rotatePiece(state.current);
      for (const offset of [0, -1, 1, -2, 2]) {
        if (canMove(state.grid, rotated, state.x + offset, state.y)) {
          return { ...state, current: rotated, x: state.x + offset };
        }
      }
      return state;
    }
    case "DROP": {
      if (!state.current || state.gameOver || state.paused) return state;
      const dropY = getDropY(state.grid, state.current, state.x, state.y);
      const merged = mergePiece(state.grid, state.current, state.x, dropY);
      const { grid, lines } = clearLines(merged);
      const newLines = state.lines + lines;
      const level = Math.floor(newLines / 10) + 1;
      const points = ((POINTS as Record<string, number>)[lines] || 0) * state.level;
      return {
        ...state,
        grid,
        current: null,
        score: state.score + points + (dropY - state.y) * 2,
        lines: newLines,
        level,
      };
    }
    case "LOCK": {
      if (!state.current || state.gameOver || state.paused) return state;
      const merged = mergePiece(state.grid, state.current, state.x, state.y);
      const { grid, lines } = clearLines(merged);
      const newLines = state.lines + lines;
      const level = Math.floor(newLines / 10) + 1;
      const points = ((POINTS as Record<string, number>)[lines] || 0) * state.level;
      return { ...state, grid, current: null, score: state.score + points, lines: newLines, level };
    }
    case "HOLD": {
      if (!state.current || !state.canHold || state.gameOver || state.paused) return state;
      const piece = state.held || state.next;
      const x = getSpawnX(piece);
      return {
        ...state,
        held: state.current,
        current: piece,
        next: state.held ? state.next : randomPiece(),
        x,
        y: 0,
        canHold: false,
      };
    }
    case "PAUSE":
      return { ...state, paused: !state.paused };
    default:
      return state;
  }
};

// Cell component
const Cell = memo<{ opacity: number | null; isGhost: boolean }>(({ opacity, isGhost }) => {
  const color = opacity ? pieceColor(opacity) : null;
  return (
    <div
      className="h-6 w-6 transition-all duration-75"
      style={{
        backgroundColor: color ? (isGhost ? `${color}33` : color) : "transparent",
        boxShadow: color && !isGhost ? `inset 0 1px 0 rgba(255,255,255,0.15)` : undefined,
        outline: isGhost && color ? `1px solid ${color}40` : "1px solid rgba(255,255,255,0.06)",
        outlineOffset: "-1px",
      }}
    />
  );
});

// Preview panel for held/next piece
const Preview = memo<{ piece: Piece | null; title: string }>(({ piece, title }) => (
  <div className="border bg-card rounded-xl border p-4">
    <p className="text-muted-foreground mb-3 text-center text-xs font-medium">{title}</p>
    <div className="flex min-h-[60px] flex-col items-center justify-center">
      {piece ? (
        piece.shape.map((row: number[], i: number) => (
          <div key={i} className="flex">
            {row.map((cell: number, j: number) => (
              <div
                key={j}
                className="h-5 w-5 transition-all duration-75"
                style={{
                  backgroundColor: cell ? pieceColor(piece.opacity) : "transparent",
                  outline: "1px solid rgba(0,0,0,0.06)",
                  outlineOffset: "-1px",
                }}
              />
            ))}
          </div>
        ))
      ) : (
        <span className="text-muted-foreground text-xs">—</span>
      )}
    </div>
  </div>
));

// Stat row inside the score panel
const StatRow = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center justify-between gap-4">
    <span className="text-muted-foreground text-xs font-medium">{label}</span>
    <span className="text-foreground text-lg font-semibold tabular-nums">{value}</span>
  </div>
);

// Controls list for the right panel
const CONTROLS = [
  { key: "← →", action: "Move" },
  { key: "↑", action: "Rotate" },
  { key: "↓", action: "Soft drop" },
  { key: "Space", action: "Hard drop" },
  { key: "C", action: "Hold piece" },
  { key: "P", action: "Pause" },
  { key: "R", action: "Restart" },
];

// Main game component
const TetrisGame: FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const lockTimer = useRef<NodeJS.Timeout | null>(null);
  const dropTimer = useRef<NodeJS.Timeout | null>(null);

  const displayGrid = (() => {
    const grid = state.grid.map((row: GameCell[]) => [...row]);
    if (state.current && !state.gameOver && state.started) {
      const ghostY = getDropY(state.grid, state.current, state.x, state.y);
      if (ghostY !== state.y) {
        for (let row = 0; row < state.current.shape.length; row++) {
          for (let col = 0; col < state.current.shape[row].length; col++) {
            if (state.current.shape[row][col] && ghostY + row >= 0) {
              grid[ghostY + row][state.x + col] = { ghost: true, opacity: state.current.opacity };
            }
          }
        }
      }
      for (let row = 0; row < state.current.shape.length; row++) {
        for (let col = 0; col < state.current.shape[row].length; col++) {
          if (state.current.shape[row][col] && state.y + row >= 0) {
            grid[state.y + row][state.x + col] = state.current.opacity;
          }
        }
      }
    }
    return grid;
  })();

  useEffect(() => {
    if (!state.started || state.gameOver || state.paused) return;
    const tick = Math.max(100, TICK_MS - (state.level - 1) * 50);
    dropTimer.current = setInterval(() => {
      if (state.current && canMove(state.grid, state.current, state.x, state.y + 1)) {
        dispatch({ type: "MOVE", dx: 0, dy: 1 });
      } else if (state.current) {
        if (!lockTimer.current) {
          lockTimer.current = setTimeout(() => {
            dispatch({ type: "LOCK" });
            lockTimer.current = null;
          }, LOCK_DELAY_MS);
        }
      }
    }, tick);
    return () => {
      if (dropTimer.current !== null) clearInterval(dropTimer.current);
      if (lockTimer.current) {
        clearTimeout(lockTimer.current);
        lockTimer.current = null;
      }
    };
  }, [
    state.started,
    state.gameOver,
    state.paused,
    state.level,
    state.current,
    state.grid,
    state.x,
    state.y,
  ]);

  useEffect(() => {
    if (state.started && !state.current && !state.gameOver) {
      const timer = setTimeout(() => dispatch({ type: "SPAWN" }), 100);
      return () => clearTimeout(timer);
    }
  }, [state.current, state.started, state.gameOver]);

  const handleKeyDown = useCallback(
    (e: Event) => {
      const ev = e as KeyboardEvent;
      if (!state.started && ev.key === "Enter") {
        dispatch({ type: "START" });
        return;
      }
      if (state.gameOver && (ev.key === "r" || ev.key === "R")) {
        dispatch({ type: "START" });
        return;
      }
      switch (ev.key) {
        case "ArrowLeft":
          ev.preventDefault();
          dispatch({ type: "MOVE", dx: -1, dy: 0 });
          break;
        case "ArrowRight":
          ev.preventDefault();
          dispatch({ type: "MOVE", dx: 1, dy: 0 });
          break;
        case "ArrowDown":
          ev.preventDefault();
          dispatch({ type: "MOVE", dx: 0, dy: 1 });
          break;
        case "ArrowUp":
          ev.preventDefault();
          dispatch({ type: "ROTATE" });
          break;
        case " ":
          ev.preventDefault();
          dispatch({ type: "DROP" });
          break;
        case "c":
        case "C":
          ev.preventDefault();
          dispatch({ type: "HOLD" });
          break;
        case "p":
        case "P":
          ev.preventDefault();
          dispatch({ type: "PAUSE" });
          break;
      }
    },
    [state.started, state.gameOver],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-6">
      <div className="flex items-start gap-5">
        {/* Left panel */}
        <div className="flex w-32 flex-col gap-3">
          <Preview piece={state.held} title="Hold" />
          <div className="border bg-card rounded-xl border p-4">
            <div className="space-y-3">
              <StatRow label="Score" value={state.score} />
              <div className="border border-t" />
              <StatRow label="Lines" value={state.lines} />
              <div className="border border-t" />
              <StatRow label="Level" value={state.level} />
            </div>
          </div>
        </div>

        {/* Board column */}
        <div className="flex flex-col items-center gap-3">
          <h3 className="text-foreground text-sm font-semibold tracking-widest uppercase">
            Tetris
          </h3>

          <div className="border relative overflow-hidden rounded-xl border bg-zinc-950 p-1">
            <div className="grid" style={{ gridTemplateColumns: `repeat(${COLS}, 1.5rem)` }}>
              {displayGrid.map((row: GameCell[], i: number) =>
                row.map((cell: GameCell, j: number) => {
                  const opacity =
                    typeof cell === "object" && cell !== null
                      ? cell.opacity
                      : typeof cell === "number"
                        ? cell
                        : null;
                  const isGhost = typeof cell === "object" && cell !== null && !!cell.ghost;
                  return <Cell key={`${i}-${j}`} opacity={opacity} isGhost={isGhost} />;
                }),
              )}
            </div>

            {/* Start overlay */}
            {!state.started && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-950/90">
                <p className="text-xs font-medium tracking-[0.16em] text-zinc-400 uppercase">
                  Ready to play
                </p>
                <Button variant="secondary" onClick={() => dispatch({ type: "START" })}>
                  Start game
                </Button>
                <p className="text-xs text-zinc-500">or press Enter</p>
              </div>
            )}

            {/* Paused overlay */}
            {state.paused && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950/90">
                <p className="text-sm font-semibold tracking-widest text-white uppercase">Paused</p>
                <Button variant="secondary" onClick={() => dispatch({ type: "PAUSE" })}>
                  Resume
                </Button>
              </div>
            )}

            {/* Game over overlay */}
            {state.gameOver && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950/90">
                <p className="text-sm font-semibold tracking-widest text-white uppercase">
                  Game Over
                </p>
                <p className="text-xs text-zinc-400 tabular-nums">Score: {state.score}</p>
                <Button variant="secondary" onClick={() => dispatch({ type: "START" })}>
                  Play again
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex w-32 flex-col gap-3">
          <Preview piece={state.next} title="Next" />

          <div className="border bg-card rounded-xl border p-4">
            <p className="text-muted-foreground mb-3 text-xs font-medium">Controls</p>
            <ul className="space-y-1.5">
              {CONTROLS.map(({ key, action }) => (
                <li key={key} className="flex items-center justify-between gap-2">
                  <kbd className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-[10px]">
                    {key}
                  </kbd>
                  <span className="text-muted-foreground text-right text-[11px]">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TetrisGame;
