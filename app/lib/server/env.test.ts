import { describe, expect, it } from "vitest";

import { LabsServerEnv } from "./env";

describe("LabsServerEnv", () => {
  it("requires the server AI credential", () => {
    expect(LabsServerEnv.safeParse({}).success).toBe(false);
    expect(LabsServerEnv.safeParse({ OPENROUTER_API_KEY: "  " }).success).toBe(false);
    expect(LabsServerEnv.safeParse({ OPENROUTER_API_KEY: "test-key" }).success).toBe(true);
  });

  it("applies service defaults and maps configured values", () => {
    expect(LabsServerEnv.parse({ OPENROUTER_API_KEY: "test-key" })).toMatchObject({
      openRouterApiKey: "test-key",
      publicDataUrl: "https://public-data-production.up.railway.app",
      r2Endpoint: "http://localhost:9000",
      r2Bucket: "labyrinth",
      r2AccessKeyId: "minioadmin",
      r2SecretAccessKey: "minioadmin",
      r2PublicUrl: "http://localhost:9000",
    });
  });

  it("trims and rejects an empty optional model override", () => {
    expect(
      LabsServerEnv.parse({ OPENROUTER_API_KEY: "test-key", NEWSBOY_AI_MODEL: " model-x " })
        .newsboyAiModel,
    ).toBe("model-x");
    expect(
      LabsServerEnv.safeParse({ OPENROUTER_API_KEY: "test-key", NEWSBOY_AI_MODEL: "  " }).success,
    ).toBe(false);
  });
});
