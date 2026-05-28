import { useEffect, useRef, useState, type JSX } from "react";

interface SelectorWindow extends Window {
  $?: (selector: string) => Element[];
}

type TagCounts = Record<string, number>;

interface TestCase {
  selector: string;
  expected: TagCounts;
}

interface TestResult {
  selector: string;
  expected: TagCounts;
  found: TagCounts;
  passed: boolean;
  error: string | null;
}

const ANSWER_JS = `
var $ = function (selector) {
  var elements = [];
  var classSelectors = [];
  var idSelectors = [];
  var tagName;
  var matcher = {
    id: new RegExp('^#'),
    class: new RegExp('^\\.'),
  };
  var selectorNames = [];

  function pushName(start, end) {
    selectorNames.push(selector.slice(start, end));
  }

  function makeArray(els) {
    return Array.prototype.slice.call(els);
  }

  var DOM = {
    search: {
      id: function(query) { return document.getElementById(query); },
      class: function(query) { return makeArray(document.getElementsByClassName(query)); },
      tag: function(query) { return makeArray(document.getElementsByTagName(query)); },
    },
  };

  var sliceStart = 0;
  var selectorLength = selector.length;

  for (var i = 1; i < selectorLength; i++) {
    if (matcher.id.test(selector[i]) || matcher.class.test(selector[i])) {
      pushName(sliceStart, i);
      sliceStart = i;
    } else if (i == selectorLength - 1) {
      pushName(sliceStart, i + 1);
    }
  }

  while (selectorNames.length > 0) {
    var sel = selectorNames[0];
    if (matcher.class.test(sel)) classSelectors.push(sel.slice(1));
    else if (matcher.id.test(sel)) idSelectors.push(sel.slice(1));
    else tagName = selectorNames[0];
    selectorNames.splice(0, 1);
  }

  var idSelectorsLength = idSelectors.length;
  var classSelectorsLength = classSelectors.length;

  function hasTagName(el) {
    return (tagName && el.tagName.toLowerCase() == tagName);
  }

  function hasClasses(base) {
    var sels = classSelectors.map(function(sel) {
      return (base && base.classList.contains(sel));
    });
    return !(sels.indexOf(false) > -1);
  }

  if (idSelectors.length > 1) return elements;

  if (idSelectorsLength == 1 && !classSelectorsLength && !tagName) {
    elements.push(DOM.search.id(idSelectors[0]));
    return elements;
  }

  if (idSelectorsLength == 1 && !!tagName) {
    var base = DOM.search.id(idSelectors[0]);
    if (hasTagName(base)) elements.push(base);
    return elements;
  }

  if (idSelectorsLength && classSelectorsLength) {
    var base = DOM.search.id(idSelectors[0]);
    if (hasClasses(base)) elements.push(base);
    return elements;
  }

  var tagResults = tagName ? DOM.search.tag(tagName) : DOM.search.tag('*');

  if (classSelectorsLength) {
    tagResults = tagResults.filter(function(el) {
      return classSelectors.every(function(cls) {
        return el.classList.contains(cls);
      });
    });
  }

  elements = tagResults;
  return elements;
};
`;

const TEST_CASES: TestCase[] = [
  { selector: "div", expected: { DIV: 2 } },
  { selector: "img.some_class", expected: { IMG: 1 } },
  { selector: "#some_id", expected: { DIV: 1 } },
  { selector: ".some_class", expected: { DIV: 1, IMG: 1 } },
  { selector: "input#some_id", expected: {} },
  { selector: "div#some_id.some_class", expected: { DIV: 1 } },
  { selector: "div.some_class#some_id", expected: { DIV: 1 } },
];

function tagCount(elements: Element[]): TagCounts {
  const counts: TagCounts = {};

  for (const element of elements) {
    counts[element.tagName] = (counts[element.tagName] || 0) + 1;
  }

  return counts;
}

function countsEqual(left: TagCounts, right: TagCounts): boolean {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  if (leftKeys.length !== rightKeys.length) {
    return false;
  }

  return leftKeys.every((key) => left[key] === right[key]);
}

function normalizeExpected(expected: TagCounts): TagCounts {
  const normalized: TagCounts = {};

  for (const [key, value] of Object.entries(expected)) {
    normalized[key.toUpperCase()] = value;
  }

  return normalized;
}

export default function Qubit(): JSX.Element {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [results, setResults] = useState<TestResult[]>([]);
  const [ran, setRan] = useState(false);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe === null) {
      return;
    }

    iframe.onload = () => {
      const testWindow = iframe.contentWindow as SelectorWindow | null;
      const select = testWindow?.$;
      if (select === undefined) {
        return;
      }

      const testResults = TEST_CASES.map<TestResult>(({ selector, expected }) => {
        let found: TagCounts = {};
        let error: string | null = null;

        try {
          found = tagCount(select(selector));
        } catch (caughtError) {
          error = caughtError instanceof Error ? caughtError.message : String(caughtError);
        }

        const normalizedExpected = normalizeExpected(expected);

        return {
          selector,
          expected: normalizedExpected,
          found,
          passed: error === null && countsEqual(found, normalizedExpected),
          error,
        };
      });

      setResults(testResults);
      setRan(true);
    };

    const testWindow = iframe.contentWindow as SelectorWindow | null;
    const documentContext = iframe.contentDocument ?? testWindow?.document;
    if (documentContext === undefined || documentContext === null) {
      return;
    }

    documentContext.open();
    documentContext.write(`
      <!DOCTYPE html>
      <html>
        <body>
          <div></div>
          <div id="some_id" class="some_class some_other_class"></div>
          <img id="some_other_id" class="some_class some_other_class" />
          <input type="text" />
          <script>${ANSWER_JS}</script>
        </body>
      </html>
    `);
    documentContext.close();

    return () => {
      iframe.onload = null;
    };
  }, []);

  const passedCount = results.filter((result) => result.passed).length;
  const totalCount = results.length;

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h1 style={{ marginBottom: "0.5rem" }}>Qubit - jQuery-like Selector</h1>
      <p style={{ color: "#666", marginBottom: "1.5rem" }}>
        Implement a <code>$(selector)</code> function that supports tag, class, id, and combined CSS
        selectors without using <code>querySelector</code>.
      </p>

      <iframe ref={iframeRef} title="qubit-sandbox" style={{ display: "none" }} />

      <h2 style={{ marginBottom: "0.75rem" }}>Test DOM</h2>
      <pre
        style={{
          background: "#f4f4f4",
          padding: "1rem",
          borderRadius: "4px",
          marginBottom: "1.5rem",
          fontSize: "0.85rem",
        }}
      >
        {`<div></div>
<div id="some_id" class="some_class some_other_class"></div>
<img id="some_other_id" class="some_class some_other_class" />
<input type="text" />`}
      </pre>

      {ran && (
        <>
          <h2 style={{ marginBottom: "0.75rem" }}>
            Results - {passedCount}/{totalCount} passed
          </h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ background: "#eee" }}>
                <th style={th}>Selector</th>
                <th style={th}>Expected</th>
                <th style={th}>Found</th>
                <th style={th}>Pass</th>
              </tr>
            </thead>
            <tbody>
              {results.map(({ selector, expected, found, passed, error }) => (
                <tr key={selector} style={{ background: passed ? "#e6ffe6" : "#ffe6e6" }}>
                  <td style={td}>
                    <code>{selector}</code>
                  </td>
                  <td style={td}>{JSON.stringify(expected)}</td>
                  <td style={td}>
                    {error !== null ? (
                      <span style={{ color: "red" }}>{error}</span>
                    ) : (
                      JSON.stringify(found)
                    )}
                  </td>
                  <td style={{ ...td, textAlign: "center" }}>{passed ? "✓" : "✗"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <h2 style={{ margin: "2rem 0 0.75rem" }}>Implementation</h2>
      <pre
        style={{
          background: "#1e1e1e",
          color: "#d4d4d4",
          padding: "1.25rem",
          borderRadius: "4px",
          overflowX: "auto",
          fontSize: "0.8rem",
          lineHeight: 1.5,
        }}
      >
        {ANSWER_JS.trim()}
      </pre>
    </div>
  );
}

const th = {
  padding: "0.5rem 0.75rem",
  textAlign: "left",
  borderBottom: "1px solid #ccc",
} as const;

const td = {
  padding: "0.5rem 0.75rem",
  borderBottom: "1px solid #ddd",
  verticalAlign: "top",
} as const;
