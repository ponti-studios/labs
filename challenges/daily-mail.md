# String & Closure Puzzles

*Courtesy of Daily Mail*

Three algorithmic problems from a single interview: a character frequency counter, a curried closure accumulator, and a graph connectivity check.

---

## 1. Character frequency map

Given a string, return a map of each letter to the number of times it appears. The approach is a single pass with a hash map: for each character, increment its count by 1, defaulting to 0 if it hasn't been seen yet.

```ts
function charMap(input: string): Record<string, number> {
  const map: Record<string, number> = {};

  for (const char of input.toLowerCase()) {
    if (/[a-z]/.test(char)) {
      map[char] = (map[char] ?? 0) + 1;
    }
  }

  return map;
}

charMap("Hello World");
// { h:1, e:1, l:3, o:2, w:1, r:1, d:1 }
```

Normalising to lowercase first means case variants are counted together. Filtering with a regex keeps the map clean — spaces, digits, and punctuation are excluded. The complexity is linear in the length of the input.

```ts
// Time:  O(n)   — one pass through the string
// Space: O(k)   — at most k=26 entries for lowercase letters
```

---

## 2. Curried closure accumulator

What does `f()()()()("a")` return? The answer is `"fooooa"`. Understanding why requires tracing the closure carefully.

```ts
function f(input?: string): string | Function {
  let state = "f";                    // captured in closure

  const q = (next?: string) => {
    if (next !== undefined) {
      state += next;                  // append argument, return final string
      return state;
    }
    state += "o";                     // no argument: append "o", return q
    return q;
  };

  return q(input);                    // first call — input is undefined, returns q
}

f()        // state = "fo",    returns q
 ()        // state = "foo",   returns q
  ()       // state = "fooo",  returns q
   ()      // state = "foooo", returns q
    ("a")  // state = "fooooa", returns "fooooa"  ✓
```

The inner function `q` closes over `state` declared in `f`'s scope. Every call to `q` with no argument mutates that shared state and returns `q` again — enabling the chained call syntax. Only the call with an argument terminates the chain.

```ts
// The key insight: q closes over 'state' in f's scope.
// Each empty call mutates the same state and returns the same q.
// Only the final call — the one with an argument — escapes the loop
// and returns the accumulated string.

// This is a manual implementation of a fold (reduce) via closure:
// each call accumulates one character into shared state.
```

---

## 3. Graph connectivity

Given a list of line segments (each defined by two points), determine whether they form a connected graph — meaning no segment is isolated from the rest.

The strategy: maintain a set of all endpoints seen so far. Process segments in order. A segment is connected if at least one of its endpoints is already in the set. If neither endpoint is known, the segment is an orphan — the graph is disconnected.

```ts
type Point = { x: number; y: number };
type Segment = { p1: Point; p2: Point };

function isConnected(segments: Segment[]): boolean {
  if (segments.length === 0) return true;

  const seen = new Set<string>();
  const key = (p: Point) => `${p.x},${p.y}`;

  seen.add(key(segments[0].p1));
  seen.add(key(segments[0].p2));

  for (let i = 1; i < segments.length; i++) {
    const { p1, p2 } = segments[i];
    if (!seen.has(key(p1)) && !seen.has(key(p2))) {
      return false; // orphan segment — disconnected graph
    }
    seen.add(key(p1));
    seen.add(key(p2));
  }

  return true;
}
```

Points are serialised to strings for use as set keys — JavaScript objects cannot be used directly as Set members with value equality. The `"x,y"` format is unambiguous for integer coordinates.

```ts
// Connected — each segment shares a point with a previous one:
const connected = [
  { p1: {x:1,y:1}, p2: {x:2,y:2} },
  { p1: {x:1,y:1}, p2: {x:0,y:0} },  // shares (1,1)
  { p1: {x:2,y:2}, p2: {x:2,y:4} },  // shares (2,2)
  { p1: {x:5,y:5}, p2: {x:2,y:4} },  // shares (2,4)
];
isConnected(connected); // true

// Disconnected — the third segment shares no point with previous ones:
const disconnected = [
  { p1: {x:1,y:1}, p2: {x:2,y:2} },
  { p1: {x:2,y:2}, p2: {x:2,y:4} },
  { p1: {x:5,y:5}, p2: {x:3,y:3} },  // orphan — neither point seen yet
];
isConnected(disconnected); // false
```

Note that this algorithm checks *chain connectivity* as segments are added in order — it is not a full reachability analysis (DFS/BFS over the complete graph). For a more general solution, a union-find data structure would handle arbitrary orderings correctly.
