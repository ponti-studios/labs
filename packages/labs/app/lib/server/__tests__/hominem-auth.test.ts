import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getServerAuth: vi.fn(),
}));

vi.mock("@ponti-studios/auth/server", () => ({
  getServerAuth: mocks.getServerAuth,
}));

import { HominemAuthEnv } from "../env";
import { buildHominemLoginUrl, getHominemUser } from "../hominem-auth";

const ORIGINAL_API_URL = process.env.HOMINEM_API_URL;
const ORIGINAL_INTERNAL_API_URL = process.env.HOMINEM_INTERNAL_API_URL;
const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

function restoreEnv() {
  if (ORIGINAL_API_URL === undefined) delete process.env.HOMINEM_API_URL;
  else process.env.HOMINEM_API_URL = ORIGINAL_API_URL;
  if (ORIGINAL_INTERNAL_API_URL === undefined) delete process.env.HOMINEM_INTERNAL_API_URL;
  else process.env.HOMINEM_INTERNAL_API_URL = ORIGINAL_INTERNAL_API_URL;
  if (ORIGINAL_NODE_ENV === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = ORIGINAL_NODE_ENV;
}

function makeRequest(cookie?: string): Request {
  return new Request("https://labs.ponti.io/", {
    headers: cookie ? { cookie } : {},
  });
}

describe("HominemAuthEnv", () => {
  beforeEach(() => {
    delete process.env.HOMINEM_API_URL;
    delete process.env.HOMINEM_INTERNAL_API_URL;
  });

  afterEach(restoreEnv);

  it("falls back to the lvh.me API URL when unset in development", () => {
    process.env.NODE_ENV = "development";
    expect(HominemAuthEnv.parse(process.env).HOMINEM_API_URL).toBe("https://api.lvh.me");
  });

  it("throws instead of silently falling back to lvh.me outside development", () => {
    process.env.NODE_ENV = "production";
    expect(() => HominemAuthEnv.parse(process.env)).toThrow(/HOMINEM_API_URL is not set/);
  });

  it("uses HOMINEM_API_URL when set", () => {
    process.env.HOMINEM_API_URL = "https://api.ponti.io";
    expect(HominemAuthEnv.parse(process.env).HOMINEM_API_URL).toBe("https://api.ponti.io");
  });

  it("falls back HOMINEM_INTERNAL_API_URL to HOMINEM_API_URL when unset", () => {
    process.env.HOMINEM_API_URL = "https://api.ponti.io";
    expect(HominemAuthEnv.parse(process.env).HOMINEM_INTERNAL_API_URL).toBe("https://api.ponti.io");
  });

  it("prefers HOMINEM_INTERNAL_API_URL when set, bypassing the public URL", () => {
    process.env.HOMINEM_API_URL = "https://api.ponti.io";
    process.env.HOMINEM_INTERNAL_API_URL = "http://hominem-api-production.railway.internal:8080";
    expect(HominemAuthEnv.parse(process.env).HOMINEM_INTERNAL_API_URL).toBe(
      "http://hominem-api-production.railway.internal:8080",
    );
  });
});

describe("getHominemUser", () => {
  beforeEach(() => {
    mocks.getServerAuth.mockReset();
    process.env.HOMINEM_API_URL = "https://api.ponti.io";
  });

  afterEach(restoreEnv);

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

  it("returns null rather than throwing when HOMINEM_API_URL is unset outside development", async () => {
    delete process.env.HOMINEM_API_URL;
    process.env.NODE_ENV = "production";

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
      apiBaseUrl: "https://api.ponti.io",
    });
  });
});

describe("buildHominemLoginUrl", () => {
  it("points at the Hominem login page with an encoded next param", () => {
    process.env.HOMINEM_API_URL = "https://api.ponti.io";
    const url = new URL(buildHominemLoginUrl("https://labs.ponti.io/"));

    expect(url.origin).toBe("https://api.ponti.io");
    expect(url.pathname).toBe("/login");
    expect(url.searchParams.get("next")).toBe("https://labs.ponti.io/");

    if (ORIGINAL_API_URL === undefined) delete process.env.HOMINEM_API_URL;
    else process.env.HOMINEM_API_URL = ORIGINAL_API_URL;
  });
});
