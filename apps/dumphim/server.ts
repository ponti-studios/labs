/**
 * Hono Server with React Router Integration
 * 
 * Handles API routes via Hono and proxies all other requests to React Router
 */

import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { createReadableStreamFromReadable } from "@react-router/node";
import type { ServerBuild, AppLoadContext } from "react-router";
import { httpSuccess } from "./app/lib/api/response";
import { getCurrentUser } from "./app/lib/api/auth";
import { createTracker } from "./app/lib/server/mutations";
import type { TrackerInsert } from "@pontistudios/db/schema";
import { invalidateTrackerCache } from "./app/lib/server/cache";

const app = new Hono();

// API Routes
const api = new Hono();

// Health check
api.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Session API
api.get("/auth/session", async (c) => {
  const user = await getCurrentUser(c.req.raw);
  return c.json(httpSuccess.ok({ user }));
});

// Trackers API
api.post("/trackers", async (c) => {
  try {
    const body = await c.req.json();
    
    // Validation
    if (!body.name || typeof body.name !== "string") {
      return c.json({ error: "Name is required" }, 400);
    }
    
    if (!body.userId || typeof body.userId !== "string") {
      return c.json({ error: "User ID is required" }, 400);
    }
    
    const trackerData: TrackerInsert = {
      name: body.name,
      hp: typeof body.hp === "string" ? body.hp : null,
      cardType: typeof body.cardType === "string" ? body.cardType : null,
      description: typeof body.description === "string" ? body.description : null,
      attacks: Array.isArray(body.attacks) ? body.attacks : null,
      strengths: Array.isArray(body.strengths) ? body.strengths : null,
      flaws: Array.isArray(body.flaws) ? body.flaws : null,
      commitmentLevel: typeof body.commitmentLevel === "string" ? body.commitmentLevel : null,
      colorTheme: typeof body.colorTheme === "string" ? body.colorTheme : null,
      photoUrl: typeof body.photoUrl === "string" ? body.photoUrl : null,
      imageScale: typeof body.imageScale === "number" ? body.imageScale : null,
      imagePosition: typeof body.imagePosition === "object" && body.imagePosition !== null
        ? body.imagePosition as { x: number; y: number }
        : null,
      userId: body.userId,
    };
    
    const tracker = await createTracker(trackerData);
    invalidateTrackerCache(tracker.id);
    
    return c.json(tracker, 201);
  } catch (error) {
    console.error("Error creating tracker:", error);
    return c.json({ error: "Failed to create tracker" }, 500);
  }
});

// Upload API - placeholder for now
api.post("/upload", async (c) => {
  // TODO: Implement file upload
  return c.json({ message: "Upload endpoint - not implemented yet" }, 501);
});

// Mount API routes
app.route("/api", api);

// React Router handler
let handler: ((request: Request) => Promise<Response>) | null = null;

async function getHandler(): Promise<(request: Request) => Promise<Response>> {
  if (handler) return handler;

  // In production, build is at ./build/server/index.js relative to server.ts
  const buildPath = "./build/server/index.js";
  const build = await import(buildPath) as unknown as ServerBuild;
  
  // Use React Router's internal handler
  const { createRequestHandler } = await import("react-router");
  handler = createRequestHandler(build, process.env.NODE_ENV as any);
  
  return handler;
}

// Proxy all other requests to React Router
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

serve({
  fetch: app.fetch,
  port,
}, (info) => {
  console.log(`🚀 Server running at http://localhost:${info.port}`);
});
