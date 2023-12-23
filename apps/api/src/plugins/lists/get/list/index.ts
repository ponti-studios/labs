import { FastifyInstance } from "fastify";

import { verifySession } from "../../../auth";

const getListRoute = (server: FastifyInstance) => {
  server.get(
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
              id: { type: "string" },
              name: { type: "string" },
              createdAt: { type: "string" },
              updatedAt: { type: "string" },
              userId: { type: "string" },
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    description: { type: "string" },
                    itemAddedAt: { type: "string" },
                    googleMapsId: { type: "string" },
                    name: { type: "string" },
                    type: { type: "string" },
                    types: { type: "array", items: { type: "string" } },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { prisma } = server;
      const { id } = request.params as { id: string };
      const list = await prisma.list.findUnique({
        where: { id },
      });

      if (!list) {
        return reply.status(404).send("List could not be found");
      }

      const items = await prisma.$queryRaw`
        SELECT 
          i.id as "id",
          p.description as description,
          i."createdAt" as "itemAddedAt",
          p."googleMapsId" as "googleMapsId",
          p.name as name,
          p.types as types,
          i.type as "type"
        FROM "Item" i
        LEFT JOIN "Place" p ON (i.type = 'PLACE' AND i."itemId" = p.id)
        WHERE i."listId" = ${id}
      `;
      return { ...list, items, userId: list.userId };
    },
  );
};

export default getListRoute;
