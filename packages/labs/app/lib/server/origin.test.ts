import { describe, expect, it } from "vitest";

import { assertSameOrigin } from "./origin";

describe("assertSameOrigin", () => {
  it("allows a matching Origin", () => {
    const request = new Request("https://labs.ponti-studio.com/api/gen/image", {
      method: "POST",
      headers: { Origin: "https://labs.ponti-studio.com" },
    });
    expect(assertSameOrigin(request)).toBeNull();
  });

  it("allows a matching Origin behind a TLS-terminating proxy", () => {
    const request = new Request("http://internal/api/gen/image", {
      method: "POST",
      headers: {
        Origin: "https://labs.ponti-studio.com",
        "x-forwarded-proto": "https, http",
        "x-forwarded-host": "labs.ponti-studio.com",
      },
    });
    expect(assertSameOrigin(request)).toBeNull();
  });

  it("rejects a missing or sister-origin Origin", () => {
    const url = "https://labs.ponti-studio.com/api/gen/image";
    expect(assertSameOrigin(new Request(url, { method: "POST" }))?.status).toBe(403);
    expect(
      assertSameOrigin(
        new Request(url, { method: "POST", headers: { Origin: "https://api.ponti.com" } }),
      )?.status,
    ).toBe(403);
  });

  it("rejects a forwarded origin that does not match the Origin header", () => {
    const request = new Request("http://internal/api/gen/image", {
      method: "POST",
      headers: {
        Origin: "https://attacker.example",
        "x-forwarded-proto": "https",
        "x-forwarded-host": "labs.ponti-studio.com",
      },
    });
    expect(assertSameOrigin(request)?.status).toBe(403);
  });
});
