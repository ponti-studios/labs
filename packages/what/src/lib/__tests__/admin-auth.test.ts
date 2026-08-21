import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getHominemUserMock } = vi.hoisted(() => ({
  getHominemUserMock: vi.fn(),
}));

vi.mock("~/lib/infrastructure/hominem-auth", () => ({
  getHominemUser: getHominemUserMock,
  buildHominemLoginUrl: (returnTo: string) =>
    `https://api.ponti.io/login?next=${encodeURIComponent(returnTo)}`,
}));

import { RouterContextProvider } from "react-router";

import { getGameAdminActor, requireGameAdmin, requireGameAdminMiddleware } from "../admin/auth";

const ORIGINAL = {
  ADMIN_SECRET: process.env.ADMIN_SECRET,
  GAME_ADMIN_EMAILS: process.env.GAME_ADMIN_EMAILS,
  NODE_ENV: process.env.NODE_ENV,
  RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
};

function adminRequest() {
  const credentials = Buffer.from("admin:secret").toString("base64");
  return new Request("https://labs.ponti.io/admin", {
    headers: { Authorization: `Basic ${credentials}` },
  });
}

describe("requireGameAdmin", () => {
  beforeEach(() => {
    process.env.ADMIN_SECRET = "secret";
    delete process.env.GAME_ADMIN_EMAILS;
    delete process.env.RAILWAY_ENVIRONMENT;
    process.env.NODE_ENV = "test";
    getHominemUserMock.mockReset();
  });

  afterEach(() => {
    for (const [key, value] of Object.entries(ORIGINAL)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it("throws 401 without Basic Auth", async () => {
    await expect(
      requireGameAdmin(new Request("https://labs.ponti.io/admin"), "loader"),
    ).rejects.toMatchObject({ status: 401 });
  });

  it("redirects a loader without a Hominem session", async () => {
    getHominemUserMock.mockResolvedValue(null);
    await expect(requireGameAdmin(adminRequest(), "loader")).rejects.toMatchObject({
      status: 302,
    });
  });

  it("throws 401 JSON for an action without a Hominem session", async () => {
    getHominemUserMock.mockResolvedValue(null);
    await expect(requireGameAdmin(adminRequest(), "action")).rejects.toMatchObject({
      status: 401,
    });
  });

  it("throws 403 when the signed-in email is off the allowlist", async () => {
    process.env.GAME_ADMIN_EMAILS = "ops@ponti.io";
    getHominemUserMock.mockResolvedValue({ id: "u1", email: "other@ponti.io" });
    await expect(requireGameAdmin(adminRequest(), "loader")).rejects.toMatchObject({
      status: 403,
    });
  });

  it("throws 503 in production when the allowlist is missing", async () => {
    process.env.NODE_ENV = "production";
    getHominemUserMock.mockResolvedValue({ id: "u1", email: "ops@ponti.io" });
    await expect(requireGameAdmin(adminRequest(), "loader")).rejects.toMatchObject({
      status: 503,
    });
  });

  it("accepts Basic + Hominem in test without an allowlist", async () => {
    getHominemUserMock.mockResolvedValue({ id: "u1", email: "ops@ponti.io" });
    const result = await requireGameAdmin(adminRequest(), "loader");
    expect(result.userId).toBe("u1");
  });

  it("lets local development open the console without Basic or Hominem", async () => {
    process.env.NODE_ENV = "development";
    delete process.env.ADMIN_SECRET;
    getHominemUserMock.mockResolvedValue(null);
    const result = await requireGameAdmin(new Request("http://localhost:3001/admin"), "loader");
    expect(result.userId).toBe("local-dev");
  });
});

describe("requireGameAdminMiddleware", () => {
  beforeEach(() => {
    process.env.ADMIN_SECRET = "secret";
    delete process.env.GAME_ADMIN_EMAILS;
    delete process.env.RAILWAY_ENVIRONMENT;
    process.env.NODE_ENV = "test";
    getHominemUserMock.mockReset();
  });

  afterEach(() => {
    for (const [key, value] of Object.entries(ORIGINAL)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it("sets the actor on context for a GET", async () => {
    getHominemUserMock.mockResolvedValue({ id: "u1", email: "ops@ponti.io" });
    const request = adminRequest();
    const context = new RouterContextProvider();
    await requireGameAdminMiddleware(
      {
        context,
        params: {},
        pattern: "",
        request,
        url: new URL(request.url),
      },
      async () => new Response(),
    );
    expect(getGameAdminActor(context).userId).toBe("u1");
  });

  it("returns 401 JSON for a POST without a Hominem session", async () => {
    getHominemUserMock.mockResolvedValue(null);
    const credentials = Buffer.from("admin:secret").toString("base64");
    const request = new Request("https://labs.ponti.io/admin", {
      method: "POST",
      headers: { Authorization: `Basic ${credentials}` },
    });
    const context = new RouterContextProvider();
    await expect(
      requireGameAdminMiddleware(
        {
          context,
          params: {},
          pattern: "",
          request,
          url: new URL(request.url),
        },
        async () => new Response(),
      ),
    ).rejects.toMatchObject({ status: 401 });
  });
});
