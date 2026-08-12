import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";

import { getDateKey } from "../app/lib/realitea/core/date";
import { generateCandidates } from "../app/lib/realitea/generation/generate.server";
import { PROMPT_TEST_FIXTURES } from "../app/lib/realitea/fixtures/prompt-test-fixtures";
import { readSourceFixture, type SourceFixture } from "../app/lib/realitea/fixtures/source-fixtures";
import { runScript } from "./_shared/run-script";

type Options = {
  promptFiles: string[];
  dateKey: string;
  sourceFixtures: string[];
  model?: string;
};

function parseOptions(): Options {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      "prompt-file": { type: "string", multiple: true },
      "date-key": { type: "string" },
      "source-fixture": { type: "string", multiple: true },
      model: { type: "string" },
    },
    strict: true,
  });

  return {
    promptFiles: values["prompt-file"] ?? [],
    dateKey: values["date-key"] ?? getDateKey(new Date()),
    sourceFixtures: values["source-fixture"] ?? [],
    model: values.model,
  };
}

function fixturePasses(fixture: (typeof PROMPT_TEST_FIXTURES)[number], result: Awaited<ReturnType<typeof generateCandidates>>) {
  const selected = result.selectedIndex === null ? null : result.candidates[result.selectedIndex];
  return selected !== null && selected !== undefined && fixture.expectedAnswers.includes(selected.validation.normalizedAnswer);
}

async function main() {
  const options = parseOptions();
  const promptFiles = options.promptFiles.length > 0
    ? options.promptFiles
    : [
        "app/lib/prompts/realitea-generation.md",
        "app/lib/prompts/realitea-generation-v2.md",
      ];
  const sourceFixtures = await Promise.all(
    options.sourceFixtures.map((fixturePath) => readSourceFixture(path.resolve(fixturePath))),
  );
  const fixtures: Array<(typeof PROMPT_TEST_FIXTURES)[number] | SourceFixture> =
    sourceFixtures.length > 0 ? sourceFixtures : PROMPT_TEST_FIXTURES;

  for (const promptFile of promptFiles) {
    const resolved = path.resolve(promptFile);
    const prompt = await readFile(resolved, "utf-8");
    let passed = 0;

    console.log(`\nPROMPT: ${promptFile}`);
    console.log("─".repeat(72));

    for (const fixture of fixtures) {
      const result = await generateCandidates(options.dateKey, {
        feedItems: "feedItems" in fixture ? fixture.feedItems : fixture.items,
        feedUrl: "sourceUrl" in fixture ? fixture.sourceUrl : `https://${fixture.sourceDomains[0]}/test-feed`,
        systemPrompt: prompt,
        ...(options.model !== undefined ? { model: options.model } : {}),
      });
      const pass = "expectedAnswers" in fixture ? fixturePasses(fixture, result) : result.selectedIndex !== null;
      if (pass) passed++;
      const selected = result.selectedIndex === null
        ? "NONE"
        : result.candidates[result.selectedIndex]?.candidate.answer ?? "NONE";
      console.log(`${pass ? "PASS" : "FAIL"} ${fixture.id.padEnd(26)} selected=${selected} valid=${result.candidates.filter((c) => c.validation.valid).length}/${result.candidates.length}`);
      if (result.llmError) console.log(`  error=${result.llmError}`);
      for (const candidate of result.candidates) {
        console.log(
          `  ${candidate.candidate.answer}: ${candidate.validation.valid ? "valid" : candidate.validation.reasons.join("; ")}`,
        );
      }
    }

    console.log(`Score: ${passed}/${fixtures.length}`);
  }
}

if (!process.env.VITEST) await runScript(main);
