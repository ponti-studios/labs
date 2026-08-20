import { afterEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_TEXT_MODEL, getConfiguredTextModel } from "./index";

describe("text model resolution", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults to DeepSeek V4 Flash", () => {
    expect(DEFAULT_TEXT_MODEL).toBe("deepseek/deepseek-v4-flash");
  });

  it("uses WHAT_AI_MODEL when set", () => {
    vi.stubEnv("WHAT_AI_MODEL", "google/gemini-3.1-flash-lite");
    expect(getConfiguredTextModel()).toBe("google/gemini-3.1-flash-lite");
  });
});
