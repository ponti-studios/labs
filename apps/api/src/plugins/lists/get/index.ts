import { FastifyInstance } from "fastify";
import { verifySession } from "../../auth";
import { z } from "zod";

const getListsRoute = (server: FastifyInstance) => {
  server.get(
    "/lists",
    {
      preValidation: verifySession,
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
        include: {
          createdBy: true,
        },
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      const userLists = await prisma.userLists.findMany({
        include: {
          list: {
            include: {
              createdBy: true,
            },
          },
        },
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      return [
        ...lists,
        ...userLists.map(({ list }) => ({
          ...list,
          createdBy: {
            email: list.createdBy.email,
          },
        })),
      ];
    },
  );
};

export default getListsRoute;
