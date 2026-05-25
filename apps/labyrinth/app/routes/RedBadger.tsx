import { useState, useRef } from "react";

type Direction = "N" | "E" | "S" | "W";
type Position = [number, number, Direction];
type RobotId = number;

interface RobotState {
  id: RobotId;
  pos: Position;
  isLost: boolean;
}

interface RobotProps {
  initialPos: Position;
  isLost: boolean;
  scentPoints: Set<string>;
  onRobotLost: (pos: Position) => void;
  gridSize: number;
  otherRobots: Map<string, Position>;
}

const DIRECTIONS: Direction[] = ["N", "E", "S", "W"];
const STEP_SIZE = 50;
const GRID_SIZE = 10;

function posToKey(row: number, col: number): string {
  return `${row},${col}`;
}

function Robot({
  initialPos,
  isLost,
  scentPoints,
  onRobotLost,
  gridSize,
  otherRobots,
}: RobotProps) {
  const [position, setPosition] = useState({
    top: (initialPos[0] - 1) * STEP_SIZE,
    left: (initialPos[1] - 1) * STEP_SIZE,
  });
  const [gridPos, setGridPos] = useState({ row: initialPos[0], col: initialPos[1] });
  const [orientation, setOrientation] = useState<Direction>(initialPos[2]);
  const [instructions, setInstructions] = useState("");
  const [lost, setLost] = useState(isLost);
  const robotRef = useRef<HTMLDivElement>(null);

  const turn = (direction: "L" | "R") => {
    const currentIndex = DIRECTIONS.indexOf(orientation);
    if (direction === "L") {
      setOrientation(DIRECTIONS[currentIndex === 0 ? 3 : currentIndex - 1]);
    } else {
      setOrientation(DIRECTIONS[currentIndex === 3 ? 0 : currentIndex + 1]);
    }
  };

  const move = () => {
    const newGridPos = { ...gridPos };
    let newTop = position.top;
    let newLeft = position.left;

    switch (orientation) {
      case "N":
        newGridPos.row -= 1;
        newTop -= STEP_SIZE;
        break;
      case "S":
        newGridPos.row += 1;
        newTop += STEP_SIZE;
        break;
      case "E":
        newGridPos.col += 1;
        newLeft += STEP_SIZE;
        break;
      case "W":
        newGridPos.col -= 1;
        newLeft -= STEP_SIZE;
        break;
    }

    if (
      newGridPos.row < 1 ||
      newGridPos.row > gridSize ||
      newGridPos.col < 1 ||
      newGridPos.col > gridSize
    ) {
      const scentKey = posToKey(gridPos.row, gridPos.col);
      if (scentPoints.has(scentKey)) {
        return;
      }
      setLost(true);
      onRobotLost([gridPos.row, gridPos.col, orientation]);
      return;
    }

    const otherRobotKey = posToKey(newGridPos.row, newGridPos.col);
    if (otherRobots.has(otherRobotKey)) {
      return;
    }

    setGridPos(newGridPos);
    setPosition({ top: newTop, left: newLeft });
  };

  const executeInstructions = (cmds: string[]) => {
    for (const cmd of cmds) {
      if (lost) break;
      if (cmd === "F") move();
      else if (cmd === "L" || cmd === "R") turn(cmd);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeInstructions(instructions.toUpperCase().split(""));
      setInstructions("");
    }
  };

  const orientationArrow: Record<Direction, string> = { N: "↑", E: "→", S: "↓", W: "←" };

  return (
    <div style={{ position: "absolute" }}>
      <input
        type="text"
        placeholder={`${initialPos[0]} ${initialPos[1]} ${initialPos[2]}`}
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        onKeyUp={handleKeyUp}
        disabled={lost}
        style={{
          position: "absolute",
          top: "450px",
          width: "100%",
          fontSize: "1.3rem",
          padding: "0.5rem",
        }}
      />
      <div
        ref={robotRef}
        className={`robot ${orientation}`}
        style={{
          position: "absolute",
          top: position.top,
          left: position.left,
          width: "50px",
          height: "50px",
          background: lost ? "#666" : "#333",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "1.5rem",
          transition: "all 0.2s",
          opacity: lost ? 0.5 : 1,
        }}
      >
        {lost ? "☠" : orientationArrow[orientation]}
      </div>
    </div>
  );
}

export default function RedBadger() {
  const [robots, setRobots] = useState<RobotState[]>([]);
  const [input, setInput] = useState("");
  const [scentPoints, setScentPoints] = useState<Set<string>>(new Set());
  const [lostCount, setLostCount] = useState(0);
  const planetRef = useRef<HTMLDivElement>(null);

  const addRobot = () => {
    const parts = input.trim().split(" ");
    if (parts.length >= 3) {
      const row = parseInt(parts[0], 10);
      const col = parseInt(parts[1], 10);
      const dir = parts[2].toUpperCase() as Direction;
      if (!isNaN(row) && !isNaN(col) && DIRECTIONS.includes(dir)) {
        if (row >= 1 && row <= GRID_SIZE && col >= 1 && col <= GRID_SIZE) {
          setRobots([...robots, { id: Date.now(), pos: [row, col, dir], isLost: false }]);
          setInput("");
        }
      }
    }
  };

  const handleRobotLost = (pos: Position) => {
    const key = posToKey(pos[0], pos[1]);
    setScentPoints((prev) => new Set(prev).add(key));
    setLostCount((prev) => prev + 1);
    setRobots((prev) =>
      prev.map((r) => {
        if (r.pos[0] === pos[0] && r.pos[1] === pos[1]) {
          return { ...r, isLost: true };
        }
        return r;
      }),
    );
  };

  const otherRobotsMap = new Map<string, Position>();
  robots.forEach((r) => {
    if (!r.isLost) {
      otherRobotsMap.set(posToKey(r.pos[0], r.pos[1]), r.pos);
    }
  });

  return (
    <div>
      <h2>Red Badger - Robot Planet</h2>
      <p>
        A Mars robot simulation. Enter robot position (e.g., "1 1 S" for row 1, col 1, facing
        South).
      </p>

      <div
        ref={planetRef}
        className="card"
        style={{
          position: "relative",
          height: "500px",
          background: "#d4a574",
          border: "4px solid #8b5a2b",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "grid",
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
            const row = Math.floor(i / GRID_SIZE) + 1;
            const col = (i % GRID_SIZE) + 1;
            const isScent = scentPoints.has(posToKey(row, col));
            return (
              <div
                key={i}
                style={{
                  border: "1px solid rgba(0,0,0,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isScent && <span style={{ fontSize: "0.8rem", opacity: 0.3 }}>⚠</span>}
              </div>
            );
          })}
        </div>

        {robots.map((robot) => (
          <Robot
            key={robot.id}
            initialPos={robot.pos}
            isLost={robot.isLost}
            scentPoints={scentPoints}
            onRobotLost={handleRobotLost}
            gridSize={GRID_SIZE}
            otherRobots={otherRobotsMap}
          />
        ))}
      </div>

      <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
        <input
          type="text"
          placeholder="1 1 N"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyUp={(e) => e.key === "Enter" && addRobot()}
          style={{
            flex: 1,
            padding: "0.5rem",
            fontSize: "1.2rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
        <button onClick={addRobot} className="btn btn-primary">
          Add Robot
        </button>
      </div>

      <div className="card" style={{ marginTop: "1rem" }}>
        <h4>Instructions</h4>
        <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
          <li>
            <strong>Position:</strong> "row col direction" (e.g., "1 1 N")
          </li>
          <li>
            <strong>Commands:</strong> F = forward, L = turn left, R = turn right
          </li>
          <li>
            <strong>Orientation:</strong> N (north/up), E (east/right), S (south/down), W
            (west/left)
          </li>
          <li>
            <strong>Lost robots:</strong> Leave a scent that prevents future robots from falling off
            at that point
          </li>
        </ul>
        {lostCount > 0 && (
          <p style={{ marginTop: "0.5rem", color: "#666" }}>Robots lost: {lostCount}</p>
        )}
      </div>
    </div>
  );
}
