#!/usr/bin/env node
import { spawn } from "node:child_process";
import { access, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const repoRoot = path.resolve(fileURLToPath(new URL("../../..", import.meta.url)));
const defaultSource = path.join(repoRoot, "tools/earth/source/imagery.tif");
const defaultOutput = path.join(repoRoot, "apps/earth/public/tiles/imagery");

const args = parseArgs(process.argv.slice(2));
const source = path.resolve(args.source ?? defaultSource);
const output = path.resolve(args.output ?? defaultOutput);
const minZoom = args.minZoom ?? "0";
const maxZoom = args.maxZoom ?? "18";

await ensureExists(source, "imagery source");
await mkdir(output, { recursive: true });

console.log(`[earth] generating imagery tiles\n  source: ${source}\n  output: ${output}\n  zoom:   ${minZoom}-${maxZoom}`);

await run("gdal2tiles.py", [
  "--xyz",
  "--processes=4",
  "--tilesize=256",
  "--zoom", `${minZoom}-${maxZoom}`,
  "--webviewer=none",
  "--resampling", "bilinear",
  source,
  output,
]);

console.log("[earth] imagery tiles complete");

function parseArgs(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      result[key] = true;
    } else {
      result[key] = next;
      i += 1;
    }
  }
  return result;
}

async function ensureExists(filePath, label) {
  try {
    await access(filePath);
  } catch {
    console.error(`Missing ${label}: ${filePath}`);
    console.error(`Create it first, then rerun this script.`);
    process.exit(1);
  }
}

function run(command, commandArgs) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, { stdio: "inherit" });
    child.on("error", (error) => {
      if ((error).code === "ENOENT") {
        reject(new Error(`${command} not found. Install GDAL utilities so gdal2tiles.py is available.`));
        return;
      }
      reject(error);
    });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}
