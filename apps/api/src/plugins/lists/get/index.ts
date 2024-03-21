import { List, User, prisma } from "@hominem/db";
import { FastifyInstance } from "fastify";
import { z } from "zod";

import { verifySession } from "../../auth";

type UserList = {
  list: List & { createdBy: User };
};

async function getUserLists(userId: string) {
  return prisma.userLists.findMany({
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
}

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
      const { userId } = request.session.get("data");
      const lists = await prisma.list.findMany({
        include: {
          createdBy: true,
        },
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      const userLists = await getUserLists(userId);

      return [
        ...lists,
        ...userLists.map(({ list }: UserList) => ({
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
