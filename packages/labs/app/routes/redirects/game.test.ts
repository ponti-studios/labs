import { afterEach, describe, expect, it } from "vitest";

import { loader } from "./game";

describe("WH?T legacy route redirect", () => {
  const originalWhatAppUrl = process.env.WHAT_APP_URL;

  afterEach(() => {
    if (originalWhatAppUrl === undefined) delete process.env.WHAT_APP_URL;
    else process.env.WHAT_APP_URL = originalWhatAppUrl;
  });

  it("redirects the exact legacy root to local What and preserves the query", async () => {
    process.env.WHAT_APP_URL = "http://localhost:5173";
    const response = await loader({
      request: new Request("https://labs.ponti.io/games/realitea?game=reality"),
    });

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("http://localhost:5173/?game=reality");
  });

  it("uses the configured production What URL", async () => {
    process.env.WHAT_APP_URL = "https://what.ponti.io";
    const response = await loader({
      request: new Request("https://labs.ponti.io/games/realitea"),
    });

    expect(response.headers.get("location")).toBe("https://what.ponti.io/");
  });
});
