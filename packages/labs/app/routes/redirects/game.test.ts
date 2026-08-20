import { describe, expect, it } from "vitest";

import { loader } from "./game";

describe("WH?T legacy route redirect", () => {
  it("permanently redirects the old game URL and preserves the query", async () => {
    const response = await loader({
      request: new Request("https://labs.ponti.io/games/realitea/history?game=reality"),
    });

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://game.ponti.io/history?game=reality");
  });
});
