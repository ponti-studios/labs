import { Hono } from "hono";
import { serve } from "@hono/node-server";
import type { ServerBuild } from "react-router";

const app = new Hono();

const api = new Hono();

api.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.route("/api", api);

let handler: ((request: Request) => Promise<Response>) | null = null;

async function getHandler(): Promise<(request: Request) => Promise<Response>> {
  if (handler) return handler;
  const buildPath = "./build/server/index.js";
  const build = (await import(buildPath)) as unknown as ServerBuild;
  const { createRequestHandler } = await import("react-router");
  handler = createRequestHandler(build, process.env.NODE_ENV as any);
  return handler;
}

app.all("/*", async (c) => {
  try {
    const reactRouterHandler = await getHandler();
    return reactRouterHandler(c.req.raw);
  } catch (error) {
    console.error("Error handling request:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server running at http://localhost:${info.port}`);
});
