import { describe, expect, it } from "vitest";

import { LabsServerEnv } from "../infrastructure/env";

describe("LabsServerEnv", () => {
  const baseEnv = { OPENROUTER_API_KEY: "test-key" };

  it("rejects an empty WHAT_AI_MODEL override", () => {
    expect(LabsServerEnv.safeParse({ ...baseEnv, WHAT_AI_MODEL: "" }).success).toBe(false);
  });

  it("accepts a non-empty WHAT_AI_MODEL override", () => {
    const result = LabsServerEnv.safeParse({
      ...baseEnv,
      WHAT_AI_MODEL: "meta/muse-spark-1.3-contributor",
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.whatAiModel).toBe("meta/muse-spark-1.3-contributor");
  });
});
