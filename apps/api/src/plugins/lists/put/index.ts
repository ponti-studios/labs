import { FastifyInstance } from "fastify";

import { verifySession } from "../../auth";

const putListRoute = (server: FastifyInstance) => {
  server.put(
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
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
          },
          required: ["name"],
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
      const { name } = request.body as { name: string };
      const list = await prisma.list.update({
        where: { id },
        data: { name },
      });
      return { list };
    },
  );
};

export default putListRoute;
