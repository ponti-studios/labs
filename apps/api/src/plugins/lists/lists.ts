import { z } from "zod";
import { FastifyPluginAsync } from "fastify";

// Example router with queries that can only be hit if the user requesting is signed in
const listsPlugin: FastifyPluginAsync = async (server) => {
  server.get(
    "/lists",
    {
      schema: {
        response: {
          200: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              createdAt: z.string(),
              updatedAt: z.string(),
            }),
          ),
        },
      },
    },
    async (request) => {
      const { prisma } = server;
      const { userId } = request.session.get("data");
      const lists = await prisma.list.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      return lists;
    },
  );

  server.post(
    "/lists",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
          },
          required: ["name"],
        },
        response: {
          200: z.object({
            list: z.object({
              id: z.string(),
              name: z.string(),
              createdAt: z.string(),
              updatedAt: z.string(),
            }),
          }),
        },
      },
    },
    async (request) => {
      const { prisma } = server;
      const { name } = request.body as { name: string };
      const { userId } = request.session.get("data");
      const list = await prisma.list.create({
        data: {
          name,
          userId,
        },
      });
      return { list };
    },
  );

  server.delete(
    "/lists/:id",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },
        response: {
          200: z.object({
            list: z.object({
              id: z.string(),
              name: z.string(),
              createdAt: z.string(),
              updatedAt: z.string(),
            }),
          }),
        },
      },
    },
    async (request) => {
      const { prisma } = server;
      const { id } = request.params as { id: string };
      const { userId } = request.session.get("data");
      const list = await prisma.list.delete({
        where: { id_userId: { id, userId } },
      });
      return { list };
    },
  );

  server.put(
    "/lists/:id",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
          },
          required: ["name"],
        },
        response: {
          200: z.object({
            list: z.object({
              id: z.string(),
              name: z.string(),
              createdAt: z.string(),
              updatedAt: z.string(),
            }),
          }),
        },
      },
    },
    async (request) => {
      const { prisma } = server;
      const { id } = request.params as { id: string };
      const { name } = request.body as { name: string };
      const { userId } = request.session.get("data");
      const list = await prisma.list.update({
        where: { id_userId: { id, userId } },
        data: { name },
      });
      return { list };
    },
  );
};

export default listsPlugin;
