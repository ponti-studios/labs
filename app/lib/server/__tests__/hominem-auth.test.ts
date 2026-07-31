import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getServerAuth: vi.fn(),
}));

vi.mock("@ponti-studios/auth/server", () => ({
  getServerAuth: mocks.getServerAuth,
}));

import {
  buildHominemLoginUrl,
  getHominemApiUrl,
  getHominemInternalApiUrl,
  getHominemUser,
} from "../hominem-auth";

const ORIGINAL_API_URL = process.env.HOMINEM_API_URL;

function makeRequest(cookie?: string): Request {
  return new Request("https://labs.ponti.io/games/realitea", {
    headers: cookie ? { cookie } : {},
  });
}

describe("getHominemApiUrl", () => {
  beforeEach(() => {
    delete process.env.HOMINEM_API_URL;
  });

  afterEach(() => {
    if (ORIGINAL_API_URL === undefined) delete process.env.HOMINEM_API_URL;
    else process.env.HOMINEM_API_URL = ORIGINAL_API_URL;
  });

  it("falls back to the local API port when unset", () => {
    expect(getHominemApiUrl()).toBe("http://localhost:4040");
  });

  it("uses HOMINEM_API_URL when set", () => {
    process.env.HOMINEM_API_URL = "https://api.ponti.io";
    expect(getHominemApiUrl()).toBe("https://api.ponti.io");
  });
});

describe("getHominemInternalApiUrl", () => {
  const ORIGINAL_INTERNAL_API_URL = process.env.HOMINEM_INTERNAL_API_URL;

  afterEach(() => {
    if (ORIGINAL_INTERNAL_API_URL === undefined) delete process.env.HOMINEM_INTERNAL_API_URL;
    else process.env.HOMINEM_INTERNAL_API_URL = ORIGINAL_INTERNAL_API_URL;
    if (ORIGINAL_API_URL === undefined) delete process.env.HOMINEM_API_URL;
    else process.env.HOMINEM_API_URL = ORIGINAL_API_URL;
  });

  it("falls back to getHominemApiUrl when HOMINEM_INTERNAL_API_URL is unset", () => {
    delete process.env.HOMINEM_INTERNAL_API_URL;
    process.env.HOMINEM_API_URL = "https://api.ponti.io";
    expect(getHominemInternalApiUrl()).toBe("https://api.ponti.io");
  });

  it("prefers HOMINEM_INTERNAL_API_URL when set, bypassing the public URL", () => {
    process.env.HOMINEM_API_URL = "https://api.ponti.io";
    process.env.HOMINEM_INTERNAL_API_URL = "http://hominem-api-production.railway.internal:8080";
    expect(getHominemInternalApiUrl()).toBe("http://hominem-api-production.railway.internal:8080");
  });
});

describe("getHominemUser", () => {
  beforeEach(() => {
    mocks.getServerAuth.mockReset();
  });

  it("returns the user when a session resolves", async () => {
    mocks.getServerAuth.mockResolvedValue({
      user: { id: "user-1", email: "player@example.com" },
      headers: new Headers(),
    });

    await expect(getHominemUser(makeRequest("session=abc"))).resolves.toEqual({
      id: "user-1",
      email: "player@example.com",
    });
  });

  it("normalizes a missing email to null", async () => {
    mocks.getServerAuth.mockResolvedValue({ user: { id: "user-1" }, headers: new Headers() });

    await expect(getHominemUser(makeRequest("session=abc"))).resolves.toEqual({
      id: "user-1",
      email: null,
    });
  });

  it("returns null when there is no session", async () => {
    mocks.getServerAuth.mockResolvedValue({ user: null, headers: new Headers() });

    await expect(getHominemUser(makeRequest())).resolves.toBeNull();
  });

  it("returns null rather than throwing when the Hominem API is unreachable", async () => {
    mocks.getServerAuth.mockRejectedValue(new Error("ECONNREFUSED"));

    await expect(getHominemUser(makeRequest("session=abc"))).resolves.toBeNull();
  });

  it("treats a session payload without a user id as signed out", async () => {
    mocks.getServerAuth.mockResolvedValue({ user: { email: "x@y.z" }, headers: new Headers() });

    await expect(getHominemUser(makeRequest("session=abc"))).resolves.toBeNull();
  });

  it("forwards the request so the auth package can read its cookies", async () => {
    mocks.getServerAuth.mockResolvedValue({ user: null, headers: new Headers() });
    const request = makeRequest("session=abc");

    await getHominemUser(request);

    expect(mocks.getServerAuth).toHaveBeenCalledWith(request, {
      apiBaseUrl: getHominemInternalApiUrl(),
    });
  });
});

describe("buildHominemLoginUrl", () => {
  it("points at the Hominem login page with an encoded next param", () => {
    process.env.HOMINEM_API_URL = "https://api.ponti.io";
    const url = new URL(buildHominemLoginUrl("https://labs.ponti.io/games/realitea"));

    expect(url.origin).toBe("https://api.ponti.io");
    expect(url.pathname).toBe("/login");
    expect(url.searchParams.get("next")).toBe("https://labs.ponti.io/games/realitea");

    if (ORIGINAL_API_URL === undefined) delete process.env.HOMINEM_API_URL;
    else process.env.HOMINEM_API_URL = ORIGINAL_API_URL;
  });
});
