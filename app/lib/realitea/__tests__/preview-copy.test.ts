import { describe, expect, it } from "vitest";

import { explainPreviewReason, previewStagePercent } from "../admin/preview-copy";

describe("preview copy", () => {
  it("turns machine reasons into operator language", () => {
    expect(explainPreviewReason("unmatched-article")).toContain("stories we sent");
    expect(explainPreviewReason("answer is leaked in clue or detail")).toContain("gives the word away");
    expect(explainPreviewReason("something unknown")).toBe("something unknown");
  });

  it("maps stages to a rising percent", () => {
    expect(previewStagePercent("prepare")).toBeLessThan(previewStagePercent("model"));
    expect(previewStagePercent("done")).toBe(100);
  });
});
