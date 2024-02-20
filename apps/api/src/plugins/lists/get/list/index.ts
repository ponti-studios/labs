import { FastifyInstance } from "fastify";

// src/plugins
import { verifySession } from "../../../auth";
import { prisma } from "../../../prisma";
import { getPlacePhoto } from "../../../google";

async function getListPlaces(listId: string): Promise<
  {
    id: string;
    itemId: string;
    description: string;
    itemAddedAt: Date;
    googleMapsId: string;
    name: string;
    imageUrl: string;
    type: string;
    types: string[];
  }[]
> {
  return prisma.$queryRaw`
    SELECT 
      i.id as "id",
      i."itemId" as "itemId",
      p.description as description,
      i."createdAt" as "itemAddedAt",
      p."googleMapsId" as "googleMapsId",
      p.name as name,
      p."imageUrl" as "imageUrl",
      p.types as types,
      i.type as "type"
    FROM "Item" i
    LEFT JOIN "Place" p ON (i.type = 'PLACE' AND i."itemId" = p.id)
    WHERE i."listId" = ${listId}
  `;
}

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
                    itemId: { type: "string" },
                    description: { type: "string" },
                    itemAddedAt: { type: "string" },
                    googleMapsId: { type: "string" },
                    name: { type: "string" },
                    imageUrl: { type: "string" },
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

      const items = await getListPlaces(id);

      return {
        ...list,
        items,
        userId: list.userId,
        photo: await getPlacePhoto(items[0].googleMapsId),
      };
    },
  );
};

export default getListRoute;
