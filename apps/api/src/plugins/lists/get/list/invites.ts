import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { FastifyInstance } from "fastify";

import { verifySession } from "../../../auth";

const getListInvitesRoute = (server: FastifyInstance) => {
  server.get(
    "/lists/:id/invites",
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
            type: "array",
            items: {
              type: "object",
              properties: {
                accepted: { type: "boolean" },
                listId: { type: "string" },
                invitedUserEmail: { type: "string" },
                invitedUserId: { type: "string" },
                // The user who created the invite
                user: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    email: { type: "string" },
                    name: { type: "string" },
                  },
                },
                createdAt: { type: "string" },
                updatedAt: { type: "string" },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { prisma } = server;
      const { id } = request.params as { id: string };
      const invites = await prisma.listInvite.findMany({
        where: { listId: id },
      });

      return reply.status(200).send(invites);
    },
  );

  // Create a new list invite route
  server.post(
    "/lists/:id/invites",
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
            email: { type: "string" },
          },
          required: ["email"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              accepted: { type: "boolean" },
              listId: { type: "string" },
              invitedUserEmail: { type: "string" },
              invitedUserId: { type: "string" },
              // The user who created the invite
              user: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  email: { type: "string" },
                  name: { type: "string" },
                },
              },
              createdAt: { type: "string" },
              updatedAt: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { prisma } = server;
      const { id } = request.params as { id: string };
      const { email } = request.body as { email: string };
      const { userId } = request.session.get("data");
      const list = await prisma.list.findUnique({ where: { id } });

      if (!list) {
        return reply.status(404).send({
          message: "List not found",
        });
      }

      let invite;
      try {
        invite = await prisma.listInvite.create({
          data: {
            listId: id,
            invitedUserEmail: email,
            invitedUserId: null,
            accepted: false,
            userId,
          },
        });
      } catch (error) {
        let err = error as PrismaClientKnownRequestError;

        switch (err.code) {
          case "P2002":
            return reply.status(400).send({
              message: "Invite already exists",
            });
          default:
            break;
        }

        return reply.status(500).send({
          message: "Something went wrong",
        });
      }

      const userEmail = await prisma.user.findUnique({
        select: { email: true },
        where: { id: userId },
      });

      // Send email to the invited user using sendgrid
      await server.sendEmail(
        email,
        "You have been invited to a list",
        `You have been invited to a list`,
        `
          <div class="email" style="font-family: sans-serif;">
            <h1>You have been invited to a list</h1>
            <p class="font-size: 16px">You have been invited to the ${list.name} list</p>
            <p class="font-size: 14px; color: grey">This list is by ${userEmail?.email}</p>
            <p>Click <a href="${process.env.APP_URL}/invites/incoming">here</a> to accept the invite</p>
          </div>
        `,
      );

      return reply.status(200).send(invite);
    },
  );
};

export default getListInvitesRoute;
