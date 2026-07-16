import { Button } from "@pontistudios/ui/primitives";
import { useEffect, useReducer, useRef } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const GRID = 5; // coordinates 0..GRID-1
const CELL_REM = 3.5;
const STEP_MS = 200; // ms between animation frames

// ─── Types ───────────────────────────────────────────────────────────────────

type Dir = "N" | "E" | "S" | "W";
type GameMode = "free" | "puzzle";
type GamePhase = "setup" | "running" | "done";

interface Robot {
  id: number;
  x: number;
  y: number;
  dir: Dir;
  lost: boolean;
}
interface PendingPos {
  x: number;
  y: number;
  dir: Dir;
}
interface TrailCell {
  x: number;
  y: number;
  order: number;
}

interface LogEntry {
  id: number;
  start: string;
  cmds: string;
  result: string;
  lost: boolean;
}

interface GameState {
  mode: GameMode;
  phase: GamePhase;
  pendingPos: PendingPos | null;
  cmdInput: string;
  activeRobot: Robot | null;
  remainingCmds: string;
  cmdIndex: number;
  trail: TrailCell[];
  robots: Robot[];
  scents: Set<string>;
  log: LogEntry[];
  target: { x: number; y: number } | null;
  victory: boolean;
}

type GameAction =
  | { type: "PLACE_ROBOT"; x: number; y: number }
  | { type: "CYCLE_DIR" }
  | { type: "APPEND_CMD"; cmd: "F" | "L" | "R" }
  | { type: "POP_CMD" }
  | { type: "CLEAR_CMDS" }
  | { type: "START_EXECUTION" }
  | { type: "STEP" }
  | { type: "RESET" }
  | { type: "TOGGLE_MODE" }
  | { type: "NEW_PUZZLE" };

// ─── Pure logic ──────────────────────────────────────────────────────────────

const DIRS: Dir[] = ["N", "E", "S", "W"];

function turnLeft(d: Dir): Dir {
  return DIRS[(DIRS.indexOf(d) + 3) % 4];
}
function turnRight(d: Dir): Dir {
  return DIRS[(DIRS.indexOf(d) + 1) % 4];
}

function stepForward(x: number, y: number, dir: Dir): [number, number] {
  if (dir === "N") return [x, y + 1];
  if (dir === "S") return [x, y - 1];
  if (dir === "E") return [x + 1, y];
  return [x - 1, y];
}

function isOffGrid(x: number, y: number): boolean {
  return x < 0 || x >= GRID || y < 0 || y >= GRID;
}

function key(x: number, y: number): string {
  return `${x},${y}`;
}

function stepOne(
  robot: Robot,
  cmd: string,
  scents: Set<string>,
): { robot: Robot; scents: Set<string>; finished: boolean } {
  let { x, y, dir } = robot;
  const newScents = new Set(scents);

  if (cmd === "L")
    return { robot: { ...robot, dir: turnLeft(dir) }, scents: newScents, finished: false };
  if (cmd === "R")
    return { robot: { ...robot, dir: turnRight(dir) }, scents: newScents, finished: false };
  if (cmd === "F") {
    const [nx, ny] = stepForward(x, y, dir);
    if (isOffGrid(nx, ny)) {
      if (newScents.has(key(x, y))) {
        // Scent saves the robot — ignore this move
        return { robot, scents: newScents, finished: false };
      }
      newScents.add(key(x, y));
      return { robot: { ...robot, lost: true }, scents: newScents, finished: true };
    }
    return { robot: { ...robot, x: nx, y: ny }, scents: newScents, finished: false };
  }
  return { robot, scents: newScents, finished: false };
}

function randomNonEdgeCell(): { x: number; y: number } {
  const x = 1 + Math.floor(Math.random() * (GRID - 2));
  const y = 1 + Math.floor(Math.random() * (GRID - 2));
  return { x, y };
}

function trailOpacity(order: number, total: number): number {
  return 0.12 + 0.35 * (order / Math.max(total - 1, 1));
}

function buildLogEntry(start: PendingPos, cmds: string, result: Robot): LogEntry {
  return {
    id: result.id,
    start: `(${start.x}, ${start.y}) ${start.dir}`,
    cmds,
    result: result.lost
      ? `LOST at (${result.x}, ${result.y}) ${result.dir}`
      : `→ (${result.x}, ${result.y}) ${result.dir}`,
    lost: result.lost,
  };
}

function initialState(): GameState {
  return {
    mode: "free",
    phase: "setup",
    pendingPos: null,
    cmdInput: "",
    activeRobot: null,
    remainingCmds: "",
    cmdIndex: 0,
    trail: [],
    robots: [],
    scents: new Set(),
    log: [],
    target: null,
    victory: false,
  };
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

function commitRobot(state: GameState): Partial<GameState> {
  const { activeRobot, pendingPos, cmdInput, robots, log, target } = state;
  if (!activeRobot || !pendingPos) return {};

  const entry = buildLogEntry(pendingPos, cmdInput, activeRobot);
  const newRobots = [...robots, activeRobot];
  const newLog = [entry, ...log];
  const victory =
    state.mode === "puzzle" &&
    target !== null &&
    !activeRobot.lost &&
    activeRobot.x === target.x &&
    activeRobot.y === target.y;

  return {
    robots: newRobots,
    log: newLog,
    victory,
    activeRobot: null,
    remainingCmds: "",
    cmdIndex: 0,
    phase: "done",
  };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "PLACE_ROBOT": {
      if (state.phase !== "setup") return state;
      const { x, y } = action;
      if (state.pendingPos && state.pendingPos.x === x && state.pendingPos.y === y) {
        // Same cell — cycle direction
        return {
          ...state,
          pendingPos: { ...state.pendingPos, dir: turnRight(state.pendingPos.dir) },
        };
      }
      return { ...state, pendingPos: { x, y, dir: "N" } };
    }

    case "CYCLE_DIR": {
      if (!state.pendingPos) return state;
      return {
        ...state,
        pendingPos: { ...state.pendingPos, dir: turnRight(state.pendingPos.dir) },
      };
    }

    case "APPEND_CMD": {
      if (state.phase !== "setup" || state.cmdInput.length >= 50) return state;
      return { ...state, cmdInput: state.cmdInput + action.cmd };
    }

    case "POP_CMD": {
      if (state.phase !== "setup") return state;
      return { ...state, cmdInput: state.cmdInput.slice(0, -1) };
    }

    case "CLEAR_CMDS": {
      if (state.phase !== "setup") return state;
      return { ...state, cmdInput: "" };
    }

    case "START_EXECUTION": {
      const { pendingPos, cmdInput } = state;
      if (!pendingPos || !cmdInput) return state;
      const activeRobot: Robot = { id: Date.now(), ...pendingPos, lost: false };
      return {
        ...state,
        activeRobot,
        remainingCmds: cmdInput,
        cmdIndex: 0,
        trail: [{ x: pendingPos.x, y: pendingPos.y, order: 0 }],
        phase: "running",
      };
    }

    case "STEP": {
      const { activeRobot, remainingCmds, scents, trail, cmdIndex } = state;
      if (state.phase !== "running" || !activeRobot || !remainingCmds.length) return state;

      const cmd = remainingCmds[0];
      const { robot: nextRobot, scents: nextScents, finished } = stepOne(activeRobot, cmd, scents);

      const moved = nextRobot.x !== activeRobot.x || nextRobot.y !== activeRobot.y;
      const nextTrail =
        moved || finished
          ? [...trail, { x: nextRobot.x, y: nextRobot.y, order: cmdIndex + 1 }]
          : trail;

      const nextRemaining = remainingCmds.slice(1);
      const isDone = finished || nextRemaining.length === 0;

      const nextState: GameState = {
        ...state,
        activeRobot: nextRobot,
        scents: nextScents,
        trail: nextTrail,
        remainingCmds: nextRemaining,
        cmdIndex: cmdIndex + 1,
      };

      if (isDone) {
        return { ...nextState, ...commitRobot({ ...nextState }) };
      }
      return nextState;
    }

    case "RESET": {
      const base = initialState();
      return { ...base, mode: state.mode, target: state.target };
    }

    case "TOGGLE_MODE": {
      const newMode: GameMode = state.mode === "free" ? "puzzle" : "free";
      const target = newMode === "puzzle" && !state.target ? randomNonEdgeCell() : state.target;
      const base = initialState();
      return { ...base, mode: newMode, target };
    }

    case "NEW_PUZZLE": {
      const base = initialState();
      return { ...base, mode: "puzzle", target: randomNonEdgeCell() };
    }

    default:
      return state;
  }
}

// ─── Arrow SVG ───────────────────────────────────────────────────────────────

function Arrow({ dir, color, size = 22 }: { dir: Dir; color: string; size?: number }) {
  const rotate = { N: 0, E: 90, S: 180, W: 270 }[dir];
  return (
    <svg width={size} height={size} viewBox="0 0 22 22">
      <g transform={`rotate(${rotate}, 11, 11)`}>
        <polygon points="11,2 19,18 11,14 3,18" fill={color} />
      </g>
    </svg>
  );
}

// ─── GridDisplay ─────────────────────────────────────────────────────────────

interface GridDisplayProps {
  robots: Robot[];
  scents: Set<string>;
  trail: TrailCell[];
  activeRobot: Robot | null;
  pendingPos: PendingPos | null;
  target: { x: number; y: number } | null;
  onCellClick: (x: number, y: number) => void;
}

function GridDisplay({
  robots,
  scents,
  trail,
  activeRobot,
  pendingPos,
  target,
  onCellClick,
}: GridDisplayProps) {
  const activeAt = new Map<string, Robot>();
  for (const r of robots) {
    if (!r.lost) activeAt.set(key(r.x, r.y), r);
  }

  const trailMap = new Map<string, TrailCell>();
  for (const t of trail) trailMap.set(key(t.x, t.y), t);

  const cells: React.ReactNode[] = [];

  for (let displayRow = 0; displayRow < GRID; displayRow++) {
    const y = GRID - 1 - displayRow;
    const cssRow = displayRow + 1;

    // Y label
    cells.push(
      <div
        key={`y-${y}`}
        style={{ gridColumn: 1, gridRow: cssRow }}
        className="text-secondary flex items-center justify-end pr-2 font-mono text-xs select-none"
      >
        {y}
      </div>,
    );

    for (let x = 0; x < GRID; x++) {
      const k = key(x, y);
      const active = activeRobot && activeRobot.x === x && activeRobot.y === y ? activeRobot : null;
      const finished = activeAt.get(k);
      const scented = scents.has(k);
      const isPending = pendingPos && pendingPos.x === x && pendingPos.y === y;
      const isTarget = target && target.x === x && target.y === y;
      const trailCell = trailMap.get(k);

      const bgColor = trailCell
        ? `rgba(59,130,246,${trailOpacity(trailCell.order, trail.length)})`
        : undefined;

      cells.push(
        <button
          key={k}
          aria-label={`Cell (${x}, ${y})`}
          onClick={() => onCellClick(x, y)}
          style={{
            gridColumn: x + 2,
            gridRow: cssRow,
            backgroundColor: bgColor,
          }}
          className={[
            "flex items-center justify-center bg-canvas border-r border-b border-subtle cursor-pointer transition-colors",
            "hover:bg-inset/30 focus:outline-none focus-visible:ring-1 focus-visible:ring-focus",
            displayRow === 0 ? "border-t" : "",
            x === 0 ? "border-l" : "",
          ].join(" ")}
        >
          {/* Target star */}
          {isTarget && !active && !finished && (
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              className="pointer-events-none absolute opacity-40"
            >
              <polygon points="9,1 11,7 17,7 12,11 14,17 9,13 4,17 6,11 1,7 7,7" fill="#f59e0b" />
            </svg>
          )}
          {/* Scent */}
          {scented && !active && !finished && (
            <span
              className="text-sm opacity-40 select-none"
              title="Robot fell off here — scent left behind"
            >
              💨
            </span>
          )}
          {/* Finished robot */}
          {finished && !active && <Arrow dir={finished.dir} color="#2563eb" />}
          {/* Active (animating) robot */}
          {active && <Arrow dir={active.dir} color="#16a34a" />}
          {/* Pending placement ghost */}
          {isPending && !active && !finished && <Arrow dir={pendingPos!.dir} color="#94a3b8" />}
        </button>,
      );
    }
  }

  // X-axis labels
  for (let x = 0; x < GRID; x++) {
    cells.push(
      <div
        key={`x-${x}`}
        style={{ gridColumn: x + 2, gridRow: GRID + 1 }}
        className="text-secondary flex items-center justify-center pt-1 font-mono text-xs select-none"
      >
        {x}
      </div>,
    );
  }

  return (
    <div className="inline-flex flex-col gap-0">
      <div className="text-secondary/60 mb-1 ml-6 flex items-center gap-1 font-mono text-xs">
        <Arrow dir="N" color="currentColor" size={14} />
        <span>N</span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `1.5rem repeat(${GRID}, ${CELL_REM}rem)`,
          gridTemplateRows: `repeat(${GRID}, ${CELL_REM}rem) 1.5rem`,
        }}
      >
        {cells}
      </div>
      <div
        className="text-secondary/60 mt-1 text-center font-mono text-xs"
        style={{ paddingLeft: "1.5rem" }}
      >
        x →
      </div>
    </div>
  );
}

// ─── CommandBuilder ───────────────────────────────────────────────────────────

function CommandBuilder({
  cmdInput,
  phase,
  dispatch,
}: {
  cmdInput: string;
  phase: GamePhase;
  dispatch: React.Dispatch<GameAction>;
}) {
  const disabled = phase !== "setup";
  const btnCls = (extra = "") =>
    `h-12 w-14 rounded border font-mono text-base font-semibold transition-colors
     ${
       disabled
         ? "border-subtle text-secondary/30 cursor-not-allowed bg-inset/10"
         : "border-default bg-canvas hover:bg-inset/40 active:bg-inset/70 cursor-pointer"
     } ${extra}`;

  return (
    <div className="space-y-2">
      <p className="text-secondary font-mono text-xs tracking-wide uppercase">Commands</p>
      <div className="flex gap-2">
        {(["F", "L", "R"] as const).map((cmd) => (
          <button
            key={cmd}
            disabled={disabled}
            className={btnCls()}
            onClick={() => dispatch({ type: "APPEND_CMD", cmd })}
            title={cmd === "F" ? "Forward" : cmd === "L" ? "Turn Left" : "Turn Right"}
          >
            {cmd}
          </button>
        ))}
        <button
          disabled={disabled || !cmdInput}
          className={btnCls("ml-1 w-10 text-sm")}
          onClick={() => dispatch({ type: "POP_CMD" })}
          title="Undo last"
        >
          ←
        </button>
        <button
          disabled={disabled || !cmdInput}
          className={btnCls("w-10 text-sm")}
          onClick={() => dispatch({ type: "CLEAR_CMDS" })}
          title="Clear all"
        >
          ✕
        </button>
      </div>
      <div className="text-primary/80 min-h-[1.5rem] font-mono text-sm tracking-widest">
        {cmdInput || (
          <span className="text-secondary/40 text-xs tracking-normal">
            Click F / L / R to build a sequence
          </span>
        )}
      </div>
    </div>
  );
}

// ─── ExecutionControls ────────────────────────────────────────────────────────

function ExecutionControls({
  phase,
  pendingPos,
  cmdInput,
  dispatch,
  onRun,
}: {
  phase: GamePhase;
  pendingPos: PendingPos | null;
  cmdInput: string;
  dispatch: React.Dispatch<GameAction>;
  onRun: () => void;
}) {
  const canRun = phase === "setup" && !!pendingPos && !!cmdInput;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1">
      <Button disabled={!canRun} onClick={onRun}>
        Run
      </Button>
      <Button variant="ghost" className="ml-auto" onClick={() => dispatch({ type: "RESET" })}>
        Reset
      </Button>
    </div>
  );
}

// ─── PuzzleBar ───────────────────────────────────────────────────────────────

function PuzzleBar({
  target,
  victory,
  dispatch,
}: {
  target: { x: number; y: number } | null;
  victory: boolean;
  dispatch: React.Dispatch<GameAction>;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-amber-200/60 bg-amber-50/30 px-3 py-2 text-sm">
      <span className="font-semibold text-amber-600">Puzzle</span>
      {target && (
        <span className="text-secondary font-mono">
          Target:{" "}
          <span className="text-primary">
            ({target.x}, {target.y})
          </span>
        </span>
      )}
      {victory && <span className="font-semibold text-green-600">Victory! 🎉</span>}
      {!victory && <span className="text-secondary/60 text-xs">Land your robot on the ★</span>}
      <button
        onClick={() => dispatch({ type: "NEW_PUZZLE" })}
        className="text-secondary hover:text-primary ml-auto font-mono text-xs underline underline-offset-2"
      >
        New Puzzle
      </button>
    </div>
  );
}

// ─── RunLog ───────────────────────────────────────────────────────────────────

function RunLog({ log }: { log: LogEntry[] }) {
  if (!log.length) return null;
  return (
    <table className="w-full border-collapse font-mono text-sm">
      <thead>
        <tr className="text-secondary border-default border-b text-xs tracking-wide uppercase">
          <th className="pb-1 text-left font-normal">Start</th>
          <th className="pb-1 text-left font-normal">Commands</th>
          <th className="pb-1 text-right font-normal">Result</th>
        </tr>
      </thead>
      <tbody>
        {log.map((e) => (
          <tr key={e.id} className="border-subtle border-b">
            <td className="text-secondary py-1.5">{e.start}</td>
            <td className="text-secondary/60 py-1.5 text-xs">{e.cmds}</td>
            <td className={`py-1.5 text-right ${e.lost ? "text-red-500" : ""}`}>{e.result}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function RedBadger() {
  const [state, dispatch] = useReducer(gameReducer, undefined, initialState);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clear timer when execution finishes
  useEffect(() => {
    if (state.phase === "done" && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [state.phase]);

  // Keyboard shortcuts: F / L / R when in setup
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "f" || e.key === "F") dispatch({ type: "APPEND_CMD", cmd: "F" });
      if (e.key === "l" || e.key === "L") dispatch({ type: "APPEND_CMD", cmd: "L" });
      if (e.key === "r" || e.key === "R") dispatch({ type: "APPEND_CMD", cmd: "R" });
      if (e.key === "Backspace") dispatch({ type: "POP_CMD" });
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function startRunAll() {
    if (timerRef.current) clearInterval(timerRef.current);
    dispatch({ type: "START_EXECUTION" });
    timerRef.current = setInterval(() => dispatch({ type: "STEP" }), STEP_MS);
  }

  function handleCellClick(x: number, y: number) {
    if (state.phase !== "setup") return;
    dispatch({ type: "PLACE_ROBOT", x, y });
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2>Red Badger — Martian Robots</h2>
          <p className="text-secondary mt-1 text-sm">
            Click a cell to place your robot. Click it again to rotate direction. Build a command
            sequence with <kbd className="bg-inset rounded px-1 font-mono text-xs">F</kbd> /{" "}
            <kbd className="bg-inset rounded px-1 font-mono text-xs">L</kbd> /{" "}
            <kbd className="bg-inset rounded px-1 font-mono text-xs">R</kbd>, then step through or
            run. A robot that falls off the edge leaves a scent — future robots skip that fatal
            move.
          </p>
          <p className="text-secondary/60 mt-0.5 text-xs">Courtesy of Red Badger</p>
        </div>
        <button
          onClick={() => dispatch({ type: "TOGGLE_MODE" })}
          className={`shrink-0 rounded border px-3 py-1.5 font-mono text-xs transition-colors
            ${
              state.mode === "puzzle"
                ? "border-amber-300 bg-amber-50/50 text-amber-700"
                : "border-default text-secondary hover:text-primary hover:border-foreground/40"
            }`}
        >
          {state.mode === "puzzle" ? "★ Puzzle" : "Puzzle mode"}
        </button>
      </div>

      {/* Puzzle bar */}
      {state.mode === "puzzle" && (
        <PuzzleBar target={state.target} victory={state.victory} dispatch={dispatch} />
      )}

      {/* Main layout: grid left, controls right */}
      <div className="flex flex-wrap items-start gap-6">
        <GridDisplay
          robots={state.robots}
          scents={state.scents}
          trail={state.trail}
          activeRobot={state.activeRobot}
          pendingPos={state.pendingPos}
          target={state.mode === "puzzle" ? state.target : null}
          onCellClick={handleCellClick}
        />

        <div className="w-full max-w-[220px] space-y-4">
          {state.pendingPos && (
            <div className="text-secondary font-mono text-xs">
              Start:{" "}
              <span className="text-primary">
                ({state.pendingPos.x}, {state.pendingPos.y}) {state.pendingPos.dir}
              </span>
              <span className="ml-2 opacity-50">click to rotate</span>
            </div>
          )}
          {!state.pendingPos && (
            <div className="text-secondary/60 text-xs">← Click a cell to place your robot</div>
          )}

          <CommandBuilder cmdInput={state.cmdInput} phase={state.phase} dispatch={dispatch} />

          <ExecutionControls
            phase={state.phase}
            pendingPos={state.pendingPos}
            cmdInput={state.cmdInput}
            dispatch={dispatch}
            onRun={startRunAll}
          />
        </div>
      </div>

      {/* Log */}
      <RunLog log={state.log} />
    </div>
  );
}
