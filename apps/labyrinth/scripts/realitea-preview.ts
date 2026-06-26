import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";

import { getDateKey } from "../app/lib/realitea-date";
import { previewCandidates } from "../app/lib/realitea-generation";
import type { GenerationPreviewResult } from "../app/lib/realitea.types";

interface PreviewOptions {
  dateKey: string;
  feedUrl?: string;
  promptFile?: string;
}

function parsePreviewArgs(): PreviewOptions {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      "date-key":    { type: "string" },
      "feed-url":    { type: "string" },
      "prompt-file": { type: "string" },
    },
    strict: true,
  });
  return {
    dateKey:    values["date-key"] ?? getDateKey(new Date()),
    feedUrl:    values["feed-url"],
    promptFile: values["prompt-file"],
  };
}

function requireEnvironment() {
  const missing = ["OPENROUTER_API_KEY"].filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

const DIVIDER = "━".repeat(50);

function printFeedSection(result: GenerationPreviewResult) {
  console.log(`\nFEED (${result.feedItemCount} items)`);
  if (result.feedItemCount === 0) {
    console.log("  (no items retrieved)");
    return;
  }
  result.feedItems.slice(0, 10).forEach((item, i) => {
    const date = item.pubDate ? ` (${item.pubDate.slice(0, 16)})` : "";
    console.log(`  ${i + 1}. "${item.title}"${date}`);
  });
  if (result.feedItemCount > 10) {
    console.log(`  ... and ${result.feedItemCount - 10} more`);
  }
}

function printCandidatesSection(result: GenerationPreviewResult) {
  console.log(`\n${DIVIDER}\n`);
  console.log(`CANDIDATES (${result.candidates.length} from LLM)\n`);

  if (result.candidates.length === 0) {
    console.log("  (no candidates returned)");
    return;
  }

  result.candidates.forEach(({ candidate, validation }, i) => {
    const isSelected = result.selectedIndex === i;
    const status = validation.valid
      ? `✓ PASS${isSelected ? "  ← SELECTED" : ""}`
      : "✗ FAIL";

    console.log(`[${i + 1}]  ${candidate.answer}  (${candidate.answerType})  ${status}`);
    console.log(`  Clue:   "${candidate.clue}"`);
    if (validation.valid) {
      if (candidate.detail) {
        const detail = candidate.detail.slice(0, 100) + (candidate.detail.length > 100 ? "..." : "");
        console.log(`  Detail: "${detail}"`);
      }
      candidate.sources.forEach((s) => console.log(`  Source: ${s.url} — ${s.title}`));
    } else {
      validation.reasons.forEach((r) => console.log(`  Reason: ${r}`));
    }
    console.log();
  });
}

function printResultSection(result: GenerationPreviewResult) {
  console.log(DIVIDER);
  console.log("\nRESULT");

  const validCount = result.candidates.filter((c) => c.validation.valid).length;
  const total = result.candidates.length;

  if (result.selectedIndex !== null) {
    const selected = result.candidates[result.selectedIndex];
    console.log(`  Selected: ${selected.candidate.answer} (candidate #${result.selectedIndex + 1})`);
  } else {
    console.log("  Selected: NONE — no candidate passed validation");
  }

  const feedErr = result.feedError ? `Feed error: ${result.feedError}` : null;
  const llmErr = result.llmError ? `LLM error: ${result.llmError}` : null;
  const errLine = [feedErr, llmErr].filter(Boolean).join("  |  ") || "none";
  console.log(`  Valid: ${validCount}/${total}   Errors: ${errLine}`);
  console.log();
}

async function main() {
  requireEnvironment();
  const opts = parsePreviewArgs();

  let systemPrompt: string | undefined;
  if (opts.promptFile) {
    const resolved = path.resolve(opts.promptFile);
    systemPrompt = await readFile(resolved, "utf-8");
    console.log(`Using custom prompt: ${opts.promptFile}`);
  }

  console.log(`\nRealiTea Preview — ${opts.dateKey}`);
  console.log(`Feed: ${opts.feedUrl ?? "https://realityblurb.com/feed"}`);
  console.log(DIVIDER);

  const result = await previewCandidates(opts.dateKey, {
    feedUrl: opts.feedUrl,
    systemPrompt,
  });

  printFeedSection(result);
  printCandidatesSection(result);
  printResultSection(result);
}

await main();
