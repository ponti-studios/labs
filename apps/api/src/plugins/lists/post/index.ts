import { FastifyInstance } from "fastify";

import { verifySession } from "../../auth";
import { EVENTS, track } from "../../../analytics";

const postListRoute = (server: FastifyInstance) => {
  server.post(
    "/lists",
    {
      preValidation: verifySession,
      schema: {
        body: {
          name: {
            type: "string",
            minLength: 3,
            maxLength: 50,
          },
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
      const { name } = request.body as { name: string };
      const { userId } = request.session.get("data");
      const list = await prisma.list.create({
        data: {
          name,
          userId,
        },
      });

      track(userId, EVENTS.USER_EVENTS.LIST_CREATED, { name });

      return { list };
    },
  );
};

export default postListRoute;
