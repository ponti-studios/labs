import { describe, expect, it } from "vitest";

import {
  generativeImageReducer,
  initialGenerativeImageFormState,
  toGenerativeImageConfig,
} from "./state";

describe("generativeImageReducer", () => {
  it("preserves the in-progress aesthetic draft while parsing committed values", () => {
    const nextState = generativeImageReducer(initialGenerativeImageFormState, {
      type: "image_specifications/updateAestheticDraft",
      value: "Raw, ",
    });

    expect(nextState.image_specifications.aestheticDraft).toBe("Raw, ");
    expect(nextState.image_specifications.aesthetic).toEqual(["Raw"]);
  });

  it("preserves the in-progress lighting effects draft while parsing committed values", () => {
    const nextState = generativeImageReducer(initialGenerativeImageFormState, {
      type: "lighting/updateEffectsDraft",
      value: "Hard flash, soft haze, ",
    });

    expect(nextState.lighting.effectsDraft).toBe("Hard flash, soft haze, ");
    expect(nextState.lighting.effects).toEqual(["Hard flash", "soft haze"]);
  });
});

describe("toGenerativeImageConfig", () => {
  it("omits draft-only form fields from the request payload", () => {
    const config = toGenerativeImageConfig(initialGenerativeImageFormState);

    expect(config.image_specifications.aesthetic).toEqual([
      "Raw",
      "Nostalgic",
      "Gritty",
      "Candid Street Portrait",
    ]);
    expect(config.lighting.effects).toEqual([
      "Strong highlights on face and body",
      "Sharp shadows behind subject",
      "High contrast",
    ]);
    expect("aestheticDraft" in config.image_specifications).toBe(false);
    expect("effectsDraft" in config.lighting).toBe(false);
  });
});
