import { useState } from "react";

function charMap(input) {
  const map = {};
  if (input.length === 0) return {};

  for (const letter of input.toLowerCase()) {
    if (/[a-z]/.test(letter)) {
      map[letter] = (map[letter] || 0) + 1;
    }
  }
  return map;
}

function f(input) {
  let state = "f";

  function q(input) {
    if (input) {
      state += input;
      return state;
    } else {
      state += "o";
      return q;
    }
  }

  return q(input);
}

function Point(x, y) {
  if (!(this instanceof Point)) return new Point(x, y);
  this.x = x;
  this.y = y;
}

function Segment(p1, p2) {
  if (!(this instanceof Segment)) return new Segment(p1, p2);
  this.p1 = p1;
  this.p2 = p2;
}

function testGraph(input) {
  const points = [];

  for (const seg of input) {
    const point1 = `${seg.p1.x},${seg.p1.y}`;
    const point2 = `${seg.p2.x},${seg.p2.y}`;

    if (points.length === 0) {
      points.push(point1);
      points.push(point2);
    } else {
      if (points.indexOf(point1) === -1 && points.indexOf(point2) === -1) {
        return false;
      } else if (points.indexOf(point1) === -1) {
        points.push(point1);
      } else if (points.indexOf(point2) === -1) {
        points.push(point2);
      }
    }
  }
  return true;
}

export default function DailyMail() {
  const [charInput, setCharInput] = useState("Hello World");
  const [charResult, setCharResult] = useState(null);

  const [fResult, setFResult] = useState(null);

  const [graphResult, setGraphResult] = useState(null);

  const runCharMap = () => {
    setCharResult(charMap(charInput));
  };

  const runF = () => {
    const result = f()()()()("a");
    setFResult(result);
  };

  const runGraph = () => {
    const inputA = [
      Segment(Point(1, 1), Point(2, 2)),
      Segment(Point(1, 1), Point(0, 0)),
      Segment(Point(2, 2), Point(2, 4)),
      Segment(Point(5, 5), Point(2, 4)),
    ];
    const inputB = [
      Segment(Point(1, 1), Point(2, 2)),
      Segment(Point(2, 2), Point(2, 4)),
      Segment(Point(5, 5), Point(3, 3)),
    ];
    setGraphResult({
      connected: testGraph(inputA),
      disconnected: testGraph(inputB),
    });
  };

  return (
    <div>
      <h2>Daily Mail - Challenges</h2>
      <p>Coding challenges from Daily Mail interview.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginTop: "1rem" }}>
        <div>
          <h3>Character Map</h3>
          <p style={{ fontSize: "0.9rem", color: "#666" }}>Count occurrences of each letter in a string.</p>
          <input
            type="text"
            value={charInput}
            onChange={e => setCharInput(e.target.value)}
            placeholder="Enter text"
            style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
          />
          <button className="btn btn-primary" onClick={runCharMap}>Run</button>
          {charResult && (
            <div style={{ marginTop: "0.5rem", padding: "0.75rem", background: "#f0f0f0", borderRadius: "4px" }}>
              <pre style={{ margin: 0, fontSize: "0.85rem" }}>{JSON.stringify(charResult, null, 2)}</pre>
            </div>
          )}
        </div>

        <div>
          <h3>Closure Function</h3>
          <p style={{ fontSize: "0.9rem", color: "#666" }}>
            <code>f()()()()("a")</code> returns <code>"fooooa"</code> - each empty call adds &quot;o&quot;, final call appends the argument.
          </p>
          <button className="btn btn-primary" onClick={runF}>Run f()()()()("a")</button>
          {fResult !== null && (
            <div style={{ marginTop: "0.5rem", padding: "0.75rem", background: "#f0f0f0", borderRadius: "4px" }}>
              <p style={{ margin: 0 }}><strong>Result:</strong> <code>{fResult}</code></p>
            </div>
          )}
        </div>

        <div>
          <h3>Graph Connectivity</h3>
          <p style={{ fontSize: "0.9rem", color: "#666" }}>
            Check if segments form a connected graph (no orphan segments).
          </p>
          <button className="btn btn-primary" onClick={runGraph}>Test</button>
          {graphResult !== null && (
            <div style={{ marginTop: "0.5rem", padding: "0.75rem", background: "#f0f0f0", borderRadius: "4px" }}>
              <p style={{ margin: "0.25rem 0" }}>
                <strong>Connected graph:</strong> {graphResult.connected ? "true" : "false"}
              </p>
              <p style={{ margin: "0.25rem 0" }}>
                <strong>Disconnected graph:</strong> {graphResult.disconnected ? "true" : "false"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
