import dotenv from "dotenv";
dotenv.config();

import cors from "@fastify/cors";
import fastify, { FastifyInstance, FastifyServerOptions } from "fastify";

import authPlugin from "./plugins/auth";
import shutdownPlugin from "./plugins/shutdown";
import prismaPlugin from "./plugins/prisma";
import emailPlugin from "./plugins/email";
import statusPlugin from "./plugins/status";
import rateLimitPlugin from "./plugins/rate-limit";
import circuitBreaker from "./plugins/circuit-breaker";
import sessionPlugin from "./plugins/session";
import usersPlugin from "./plugins/user";
import adminPlugin from "./plugins/admin";
import bookmarksPlugin from "./plugins/bookmarks";
import ideasPlugin from "./plugins/ideas";
import listsPlugin from "./plugins/lists";
import invites from "./plugins/invites";
import PlacesPlugin from "./plugins/places";

const { APP_URL, JWT_SECRET, PORT } = process.env;

export async function createServer(
  opts: FastifyServerOptions = {},
): Promise<FastifyInstance> {
  const server = fastify(opts);

  if (!APP_URL) {
    server.log.error("Missing APP_URL env var");
    process.exit(1);
  }

  server.log.info(`App URL: ${APP_URL}`);
  await server.register(cors, {
    origin: [APP_URL],
    credentials: true,
  });
  server.register(shutdownPlugin);
  server.register(sessionPlugin);
  server.register(require("@fastify/csrf-protection"), {
    sessionPlugin: "@fastify/secure-session",
  });
  server.register(require("@fastify/helmet"));
  server.register(require("@fastify/jwt"), {
    secret: JWT_SECRET,
  });
  server.register(circuitBreaker);
  server.register(prismaPlugin);
  server.register(rateLimitPlugin);
  server.register(statusPlugin);
  server.register(emailPlugin);
  server.register(adminPlugin);
  server.register(authPlugin);
  server.register(usersPlugin);
  server.register(listsPlugin);
  server.register(PlacesPlugin);
  server.register(invites);
  server.register(bookmarksPlugin);
  server.register(ideasPlugin);

  server.setErrorHandler((error, request, reply) => {
    console.error(error);
    reply.status(500).send({ error: "Internal server error" });
  });

  return server;
}

export async function startServer() {
  const server = await createServer({
    logger: true,
    disableRequestLogging: process.env.ENABLE_REQUEST_LOGGING !== "true",
  });

  if (!PORT) {
    server.log.error("Missing PORT env var");
    process.exit(1);
  }

  try {
    await server.listen({ port: +PORT, host: "0.0.0.0" });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}
