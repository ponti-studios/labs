import { describe, expect, it } from "vitest";

import { assertSameOrigin } from "~/lib/server/origin";

describe("assertSameOrigin", () => {
  it("allows a matching Origin", () => {
    const request = new Request("https://labs.ponti.io/games/game/admin", {
      method: "POST",
      headers: { Origin: "https://labs.ponti.io" },
    });
    expect(assertSameOrigin(request)).toBeNull();
  });

  it("rejects a missing or sister-origin Origin", () => {
    const url = "https://labs.ponti.io/games/game/admin";
    expect(assertSameOrigin(new Request(url, { method: "POST" }))?.status).toBe(403);
    expect(
      assertSameOrigin(
        new Request(url, { method: "POST", headers: { Origin: "https://api.ponti.io" } }),
      )?.status,
    ).toBe(403);
  });
});
