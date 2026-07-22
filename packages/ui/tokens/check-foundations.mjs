import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const tailwindTheme = require.resolve("tailwindcss/theme.css");
const tailwind = readFileSync(tailwindTheme, "utf8");
const generated = readFileSync(new URL("../src/tokens/generated/foundations.css", import.meta.url), "utf8");

const declarations = (css) => [...css.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]);
const expected = declarations(tailwind);
const actual = declarations(generated);
const failures = [];
const normalize = (value) => value
  .replaceAll(/\b0px\b/g, "0")
  .replaceAll(/ 0 0 (rgb\()/g, " $1")
  .replaceAll(/\s+/g, " ")
  .trim();
const expectedValues = new Map(expected);
const generatedNames = new Set();

for (const [name, value] of actual) {
  if (generatedNames.has(name)) failures.push(`duplicate generated foundation variable: ${name}`);
  generatedNames.add(name);

  const tailwindValue = expectedValues.get(name);
  if (tailwindValue !== undefined && normalize(value) !== normalize(tailwindValue)) {
    failures.push(`${name}: generated ${value}; Tailwind ${tailwindValue}`);
  }
}

if (/--[\w-]+:\s*var\(--[\w-]+\)/.test(generated)) failures.push("generated foundations contain a custom-property alias");
if (/--tracking-[\w-]+:\s*-?\d+(?:\.\d+)?\s*;/.test(generated)) failures.push("tracking values must carry a CSS unit");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Foundation conformance passed (${actual.length} generated variables; ${expectedValues.size} Tailwind variables available for comparison).`);
