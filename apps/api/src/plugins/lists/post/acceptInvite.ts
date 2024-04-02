import type { FastifyInstance } from "fastify";

import { prisma } from "@hominem/db";
import { verifySession } from "../../auth";

const acceptListInviteRoute = async (server: FastifyInstance) => {
  server.post(
    "/invites/:listId/accept",
    {
      preValidation: verifySession,
      schema: {
        params: {
          listId: { type: "string" },
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
    async (request, reply) => {
      const { listId } = request.params as { listId: string };
      const { email, userId } = request.session.get("data");
      const listInviteArgs = {
        listId_invitedUserEmail: { listId, invitedUserEmail: email },
      };
      const invite = await prisma.listInvite.findUnique({
        where: { listId_invitedUserEmail: { listId, invitedUserEmail: email } },
      });

      if (!invite) {
        return reply.status(404).send();
      }

      if (invite.invitedUserEmail !== email) {
        return reply.status(403).send();
      }

      const list = await prisma.list.findUnique({
        where: { id: invite.listId },
      });

      await prisma.listInvite.update({
        where: listInviteArgs,
        data: { accepted: true },
      });

      await prisma.userLists.create({
        data: {
          userId,
          listId: invite.listId,
        },
      });

      return { list };
    },
  );
};

export default acceptListInviteRoute;
