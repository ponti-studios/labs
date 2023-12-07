import { FastifyInstance } from "fastify";

import { verifySession } from "../../auth";

const deleteListRoute = (server: FastifyInstance) => {
  server.delete(
    "/lists/:id",
    {
      preValidation: verifySession,
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              list: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  createdAt: { type: "string" },
                  updatedAt: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    async (request) => {
      const { prisma } = server;
      const { id } = request.params as { id: string };
      const list = await prisma.list.delete({
        where: { id },
      });
      return { list };
    },
  );
};

export default deleteListRoute;
