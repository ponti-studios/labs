import { createServer, type Server } from "node:http";

import { afterEach, describe, expect, it } from "vitest";

import { getWhatUser, loginUrl } from "./auth";

type TestApi = {
  server: Server;
  url: string;
  requests: Array<{ path: string; cookie: string | undefined }>;
};

async function startAuthApi(response: { status?: number; body: unknown }): Promise<TestApi> {
  const requests: TestApi["requests"] = [];
  const server = createServer((request, responseStream) => {
    requests.push({ path: request.url ?? "", cookie: request.headers.cookie });
    responseStream.writeHead(response.status ?? 200, { "content-type": "application/json" });
    responseStream.end(JSON.stringify(response.body));
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  if (!address || typeof address === "string") throw new Error("auth test server did not start");
  return { server, url: `http://127.0.0.1:${address.port}`, requests };
}

async function stopAuthApi(server: Server) {
  await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
}

const originalApiUrl = process.env.HOMINEM_API_URL;
const originalInternalApiUrl = process.env.HOMINEM_INTERNAL_API_URL;
const originalWhatUrl = process.env.WHAT_URL;

afterEach(() => {
  if (originalApiUrl === undefined) delete process.env.HOMINEM_API_URL;
  else process.env.HOMINEM_API_URL = originalApiUrl;
  if (originalInternalApiUrl === undefined) delete process.env.HOMINEM_INTERNAL_API_URL;
  else process.env.HOMINEM_INTERNAL_API_URL = originalInternalApiUrl;
  if (originalWhatUrl === undefined) delete process.env.WHAT_URL;
  else process.env.WHAT_URL = originalWhatUrl;
});

describe("What ↔ Hominem authentication boundary", () => {
  it("forwards the browser session cookie to Hominem and returns the authenticated user", async () => {
    const api = await startAuthApi({
      body: {
        session: { id: "session-1" },
        user: { id: "user-1", email: "player@example.com" },
      },
    });
    process.env.HOMINEM_INTERNAL_API_URL = api.url;
    process.env.HOMINEM_API_URL = "https://api.ponti.io";

    try {
      await expect(
        getWhatUser(new Request("https://what.ponti.io/", { headers: { cookie: "better-auth.session_token=test" } })),
      ).resolves.toEqual({ id: "user-1", email: "player@example.com" });
      expect(api.requests).toEqual([
        { path: "/api/auth/get-session", cookie: "better-auth.session_token=test" },
      ]);
    } finally {
      await stopAuthApi(api.server);
    }
  });

  it("fails closed when Hominem reports no session", async () => {
    const api = await startAuthApi({ body: { session: null, user: null } });
    process.env.HOMINEM_INTERNAL_API_URL = api.url;

    try {
      await expect(getWhatUser(new Request("https://what.ponti.io/"))).resolves.toBeNull();
    } finally {
      await stopAuthApi(api.server);
    }
  });

  it("uses WHAT_URL for the login return target while keeping the API public URL", async () => {
    process.env.HOMINEM_API_URL = "https://api.ponti.io";
    process.env.WHAT_URL = "https://what.ponti.io";

    const url = new URL(
      loginUrl(new Request("http://internal:3000/games/what"), "https://internal:3000/games/what"),
    );
    expect(url.origin).toBe("https://api.ponti.io");
    expect(url.pathname).toBe("/login");
    expect(url.searchParams.get("next")).toBe("https://what.ponti.io/games/what");
  });
});
