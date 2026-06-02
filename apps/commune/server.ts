import { Hono } from "hono";
import { serve } from "@hono/node-server";
import type { ServerBuild } from "react-router";
import { httpSuccess } from "./app/lib/api/response";
import { getCurrentUser } from "./app/lib/auth-server";
import { createCase } from "./app/lib/server/mutations";
import type { CaseCreateInput } from "./app/lib/server/mutations";
import { invalidateCaseCache } from "./app/lib/server/cache";

const app = new Hono();

const api = new Hono();

api.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

api.get("/auth/session", async (c) => {
  const user = await getCurrentUser(c.req.raw);
  return c.json(httpSuccess.ok({ user }));
});

api.post("/cases", async (c) => {
  try {
    const body = await c.req.json();

    if (!body.name || typeof body.name !== "string") {
      return c.json({ error: "Name is required" }, 400);
    }
    if (!body.userId || typeof body.userId !== "string") {
      return c.json({ error: "User ID is required" }, 400);
    }

    const caseData: CaseCreateInput = {
      name: body.name,
      hp: typeof body.hp === "string" ? body.hp : null,
      cardType: typeof body.cardType === "string" ? body.cardType : null,
      description: typeof body.description === "string" ? body.description : null,
      attacks: Array.isArray(body.attacks) ? (body.attacks as { name: string; damage: number }[]) : null,
      strengths: Array.isArray(body.strengths) ? (body.strengths as string[]) : null,
      flaws: Array.isArray(body.flaws) ? (body.flaws as string[]) : null,
      commitmentLevel: typeof body.commitmentLevel === "string" ? body.commitmentLevel : null,
      colorTheme: typeof body.colorTheme === "string" ? body.colorTheme : null,
      photoUrl: typeof body.photoUrl === "string" ? body.photoUrl : null,
      imageScale: typeof body.imageScale === "number" ? body.imageScale : null,
      imagePosition:
        typeof body.imagePosition === "object" && body.imagePosition !== null
          ? (body.imagePosition as { x: number; y: number })
          : null,
      userId: body.userId,
    };

    const caseRecord = await createCase(caseData);
    invalidateCaseCache(caseRecord.id);
    return c.json(caseRecord, 201);
  } catch (error) {
    console.error("Error creating case:", error);
    return c.json({ error: "Failed to create case" }, 500);
  }
});

api.post("/upload", async (c) => {
  return c.json({ message: "Upload endpoint - not implemented yet" }, 501);
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
