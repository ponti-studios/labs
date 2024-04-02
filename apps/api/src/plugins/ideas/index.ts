import { prisma } from "@hominem/db";
import type {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyRequest,
} from "fastify";

const ideaSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    description: { type: "string" },
    createdAt: { type: "string" },
    updatedAt: { type: "string" },
  },
};
const ideasPlugin: FastifyPluginAsync = async (server: FastifyInstance) => {
  server.get(
    "/ideas",
    {
      schema: {
        response: {
          200: {
            type: "array",
            items: ideaSchema,
          },
        },
      },
    },
    async (request) => {
      const { userId } = request.session.get("data");
      const ideas = await prisma.idea.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      return ideas;
    },
  );

  server.post(
    "/ideas",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            description: { type: "string" },
          },
          required: ["description"],
        },
        response: {
          200: ideaSchema,
        },
      },
    },
    async (request: FastifyRequest) => {
      const { description } = request.body as { description: string };
      const { userId } = request.session.get("data");
      const idea = await prisma.idea.create({
        data: {
          description,
          userId,
        },
      });
      return idea;
    },
  );

  server.delete(
    "/ideas/:id",
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
          200: ideaSchema,
        },
      },
    },
    async (request) => {
      const { id } = request.params as { id: string };
      const idea = await prisma.idea.delete({
        where: { id },
      });
      return idea;
    },
  );
};

export default ideasPlugin;
