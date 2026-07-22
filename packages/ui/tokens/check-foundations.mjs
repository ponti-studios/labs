import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const tailwindTheme = require.resolve("tailwindcss/theme.css");
const tailwind = readFileSync(tailwindTheme, "utf8");
const generated = readFileSync(new URL("../src/tokens/generated/foundations.css", import.meta.url), "utf8");
const generatedNative = readFileSync(new URL("../src/tokens/generated/foundations.generated.ts", import.meta.url), "utf8");

const declarations = (css) => Object.fromEntries(
  [...css.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]),
);
const expected = declarations(tailwind);
const actual = declarations(generated);
const failures = [];
const requiredVariables = [
  "--spacing", "--font-sans", "--font-serif", "--font-mono", "--text-xs", "--text-9xl",
  "--font-weight-thin", "--font-weight-black", "--tracking-tighter", "--tracking-widest",
  "--leading-tight", "--leading-loose", "--radius-xs", "--radius-4xl", "--shadow-2xl",
  "--breakpoint-2xl", "--container-7xl", "--z-index-50", "--ease-in-out", "--animate-pulse",
];
for (const name of requiredVariables) {
  if (!(name in actual)) failures.push(`missing required Tailwind foundation variable: ${name}`);
}
for (const [key, value] of [["0-5", "0.125rem"], ["1-5", "0.375rem"], ["2-5", "0.625rem"], ["3-5", "0.875rem"]]) {
  if (!generatedNative.includes(`"${key}": "${value}"`)) failures.push(`missing native fractional spacing token: ${key}`);
}
const generatedNames = [...generated.matchAll(/(--[\w-]+):/g)].map(([, name]) => name);
if (new Set(generatedNames).size !== generatedNames.length) failures.push("generated foundations contain duplicate custom-property paths");
const normalize = (value) => value
  .replaceAll(/\b0px\b/g, "0")
  .replaceAll(/ 0 0 (rgb\()/g, " $1")
  .replaceAll(/\s+/g, " ")
  .trim();
for (const [name, value] of Object.entries(actual)) {
  if (!(name in expected)) continue;
  if (normalize(value) !== normalize(expected[name])) {
    failures.push(`${name}: generated ${value}; Tailwind ${expected[name]}`);
  }
}

const legacy = /--(content-width|font-family|font-size|line-height|letter-spacing|translate-distance|duration-(enter|exit|standard|breezy|spin)|radius-(base|icon)|z-index-(base|raised|dropdown|overlay|modal|toast|max))/;
if (legacy.test(generated)) failures.push("generated foundations contain a removed legacy foundation name");
if (/--[\w-]+:\s*var\(--[\w-]+\)/.test(generated)) failures.push("generated foundations contain a custom-property alias");
if (/--tracking-[\w-]+:\s*-?\d+(?:\.\d+)?\s*;/.test(generated)) failures.push("tracking values must carry a CSS unit");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Foundation conformance passed (${Object.keys(actual).length} generated variables).`);
