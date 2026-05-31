import { useState, type ChangeEvent, type JSX } from "react";
import { Button, Input } from "@pontistudios/ui";

type CharacterCounts = Record<string, number>;

interface Point {
  x: number;
  y: number;
}

interface Segment {
  p1: Point;
  p2: Point;
}

interface GraphResult {
  connected: boolean;
  disconnected: boolean;
}

type ClosureResult = string | ClosureRunner;
type ClosureRunner = (input?: string) => ClosureResult;

function charMap(input: string): CharacterCounts {
  const map: CharacterCounts = {};
  if (input.length === 0) {
    return map;
  }

  for (const letter of input.toLowerCase()) {
    if (/[a-z]/.test(letter)) {
      map[letter] = (map[letter] || 0) + 1;
    }
  }

  return map;
}

function f(input?: string): ClosureResult {
  let state = "f";

  const q: ClosureRunner = (nextInput?: string) => {
    if (nextInput) {
      state += nextInput;
      return state;
    }

    state += "o";
    return q;
  };

  return q(input);
}

function createPoint(x: number, y: number): Point {
  return { x, y };
}

function createSegment(p1: Point, p2: Point): Segment {
  return { p1, p2 };
}

function testGraph(input: Segment[]): boolean {
  const points: string[] = [];

  for (const segment of input) {
    const point1 = `${segment.p1.x},${segment.p1.y}`;
    const point2 = `${segment.p2.x},${segment.p2.y}`;

    if (points.length === 0) {
      points.push(point1, point2);
      continue;
    }

    if (!points.includes(point1) && !points.includes(point2)) {
      return false;
    }

    if (!points.includes(point1)) {
      points.push(point1);
    } else if (!points.includes(point2)) {
      points.push(point2);
    }
  }

  return true;
}

/**
 * Daily Mail Take-Home Challenge
 *
 * Task: Solve a series of algorithmic and logic problems including character mapping
 * and graphing/closure challenges, and visualize the results.
 */
export default function DailyMail(): JSX.Element {
  const [charInput, setCharInput] = useState("Hello World");
  const [charResult, setCharResult] = useState<CharacterCounts | null>(null);
  const [fResult, setFResult] = useState<string | null>(null);
  const [graphResult, setGraphResult] = useState<GraphResult | null>(null);

  const runCharMap = (): void => {
    setCharResult(charMap(charInput));
  };

  const runF = (): void => {
    const firstCall = f();
    if (typeof firstCall !== "function") {
      return;
    }

    const secondCall = firstCall();
    if (typeof secondCall !== "function") {
      return;
    }

    const thirdCall = secondCall();
    if (typeof thirdCall !== "function") {
      return;
    }

    const fourthCall = thirdCall();
    if (typeof fourthCall !== "function") {
      return;
    }

    const result = fourthCall("a");
    if (typeof result === "string") {
      setFResult(result);
    }
  };

  const runGraph = (): void => {
    const inputA: Segment[] = [
      createSegment(createPoint(1, 1), createPoint(2, 2)),
      createSegment(createPoint(1, 1), createPoint(0, 0)),
      createSegment(createPoint(2, 2), createPoint(2, 4)),
      createSegment(createPoint(5, 5), createPoint(2, 4)),
    ];
    const inputB: Segment[] = [
      createSegment(createPoint(1, 1), createPoint(2, 2)),
      createSegment(createPoint(2, 2), createPoint(2, 4)),
      createSegment(createPoint(5, 5), createPoint(3, 3)),
    ];

    setGraphResult({
      connected: testGraph(inputA),
      disconnected: testGraph(inputB),
    });
  };

  const handleCharInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setCharInput(event.target.value);
  };

  return (
    <div>
      <h2>Daily Mail - Challenges</h2>
      <p>Coding challenges from Daily Mail interview.</p>

      <div className="grid grid-cols-2 gap-8 mt-4">
        <div>
          <h3>Character Map</h3>
          <p className="text-[0.9rem] text-[#666]">Count occurrences of each letter in a string.</p>
          <Input
            type="text"
            value={charInput}
            onChange={handleCharInputChange}
            placeholder="Enter text"
          />
          <Button className="btn btn-primary" onClick={runCharMap}>
            Run
          </Button>
          {charResult && (
            <div className="mt-2 p-3 bg-[#f0f0f0] rounded-[4px]">
              <pre className="m-0 text-[0.85rem]">{JSON.stringify(charResult, null, 2)}</pre>
            </div>
          )}
        </div>

        <div>
          <h3>Closure Function</h3>
          <p className="text-[0.9rem] text-[#666]">
            <code>f()()()()("a")</code> returns <code>"fooooa"</code> - each empty call adds
            &quot;o&quot;, final call appends the argument.
          </p>
          <Button className="btn btn-primary" onClick={runF}>
            Run f()()()()("a")
          </Button>
          {fResult !== null && (
            <div className="mt-2 p-3 bg-[#f0f0f0] rounded-[4px]">
              <p className="m-0">
                <strong>Result:</strong> <code>{fResult}</code>
              </p>
            </div>
          )}
        </div>

        <div>
          <h3>Graph Connectivity</h3>
          <p className="text-[0.9rem] text-[#666]">
            Check if segments form a connected graph (no orphan segments).
          </p>
          <Button className="btn btn-primary" onClick={runGraph}>
            Test
          </Button>
          {graphResult !== null && (
            <div className="mt-2 p-3 bg-[#f0f0f0] rounded-[4px]">
              <p className="my-1">
                <strong>Connected graph:</strong> {graphResult.connected ? "true" : "false"}
              </p>
              <p className="my-1">
                <strong>Disconnected graph:</strong> {graphResult.disconnected ? "true" : "false"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
