import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { writeLlmAnalyticsRecord } from "./llm-analytics";

const createdDirectories: string[] = [];

afterEach(async () => {
  delete process.env.LLM_ANALYTICS_DIR;

  await Promise.all(
    createdDirectories
      .splice(0, createdDirectories.length)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe("writeLlmAnalyticsRecord", () => {
  it("writes a normalized JSON envelope and redacts secrets", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "llm-analytics-"));
    createdDirectories.push(directory);
    process.env.LLM_ANALYTICS_DIR = directory;

    const filePath = await writeLlmAnalyticsRecord({
      createdAt: new Date("2026-06-17T12:34:56.000Z"),
      feature: "realitea",
      metadata: {
        dateKey: "2026-06-18",
      },
      model: "openai/gpt-5.1",
      operation: "source-collection",
      provider: "openrouter",
      request: {
        apiKey: "super-secret",
        headers: {
          Authorization: "Bearer secret",
        },
      },
      response: {
        usage: {
          total_tokens: 123,
        },
      },
      status: "success",
      usage: {
        completionTokens: 23,
        promptTokens: 100,
        totalTokens: 123,
      },
    });

    const payload = JSON.parse(await readFile(filePath, "utf8")) as {
      feature: string;
      request: {
        apiKey: string;
        headers: {
          Authorization: string;
        };
      };
      usage: {
        totalTokens: number;
      };
    };

    expect(payload.feature).toBe("realitea");
    expect(payload.request.apiKey).toBe("[redacted]");
    expect(payload.request.headers.Authorization).toBe("[redacted]");
    expect(payload.usage.totalTokens).toBe(123);
  });
});
