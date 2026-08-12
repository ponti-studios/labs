import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";

import { getDateKey } from "../app/lib/realitea/date";
import { previewCandidates } from "../app/lib/realitea/generation";
import { PROMPT_TEST_FIXTURES } from "../app/lib/realitea/prompt-test-fixtures";
import { readSourceFixture, type SourceFixture } from "../app/lib/realitea/source-fixtures";
import { LabyrinthServerEnv } from "../app/lib/server/env";

type Options = {
  promptFiles: string[];
  dateKey: string;
  sourceFixtures: string[];
  model?: string;
  baseUrl?: string;
  maxTokens?: string;
};

function parseOptions(): Options {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      "prompt-file": { type: "string", multiple: true },
      "date-key": { type: "string" },
      "source-fixture": { type: "string", multiple: true },
      model: { type: "string" },
      "base-url": { type: "string" },
      "max-tokens": { type: "string" },
    },
    strict: true,
  });

  return {
    promptFiles: values["prompt-file"] ?? [],
    dateKey: values["date-key"] ?? getDateKey(new Date()),
    sourceFixtures: values["source-fixture"] ?? [],
    model: values.model,
    baseUrl: values["base-url"],
    maxTokens: values["max-tokens"],
  };
}

function fixturePasses(fixture: (typeof PROMPT_TEST_FIXTURES)[number], result: Awaited<ReturnType<typeof previewCandidates>>) {
  const selected = result.selectedIndex === null ? null : result.candidates[result.selectedIndex];
  return selected !== null && selected !== undefined && fixture.expectedAnswers.includes(selected.validation.normalizedAnswer);
}

async function main() {
  LabyrinthServerEnv.parse(process.env);
  const options = parseOptions();
  if (options.model) process.env.REALITEA_AI_MODEL = options.model;
  if (options.baseUrl) process.env.REALITEA_AI_BASE_URL = options.baseUrl;
  if (options.maxTokens) process.env.REALITEA_AI_MAX_TOKENS = options.maxTokens;
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
      const result = await previewCandidates(options.dateKey, {
        feedItems: "feedItems" in fixture ? fixture.feedItems : fixture.items,
        feedUrl: "sourceUrl" in fixture ? fixture.sourceUrl : `https://${fixture.sourceDomains[0]}/test-feed`,
        systemPrompt: prompt,
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

await main();
