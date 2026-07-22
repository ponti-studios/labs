import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const mode = process.argv[2];
const roots = mode === "--shadcn" ? ["src/components", "src/animations.css"] : ["src"];

function filesIn(path) {
  if (!statSync(path).isDirectory()) return [path];
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) =>
    filesIn(join(path, entry.name)),
  );
}

const files = roots.flatMap(filesIn).filter((path) => !statSync(path).isDirectory());
const source = files.map((path) => [path, readFileSync(path, "utf8")]);

const checks = {
  "--no-radix": ["@radix-ui"],
  "--shadcn": [
    /bg-(canvas|panel|raised|inset)/,
    /text-tertiary[^-]/,
    /text-disabled[^-]/,
    /text-on-accent/,
    /text-on-destructive/,
    /text-text-/,
    /border-(default|subtle|strong|focus)/,
    /ring-focus/,
    /\b(heading|body|subheading)-[1-4]\b/,
    /overlay-backdrop/,
    /sheet-(edge|glass)/,
    /navigation-(shell|inner|link|cta)/,
  ],
};

const forbidden = checks[mode] ?? [];
if (!forbidden.length) {
  console.error(`unknown source check: ${mode}`);
  process.exit(1);
}

const failures = [];
for (const [path, contents] of source) {
  for (const pattern of forbidden) {
    const matches = pattern instanceof RegExp ? pattern.test(contents) : contents.includes(pattern);
    if (matches) {
      failures.push(`${path}: ${pattern}`);
    }
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
