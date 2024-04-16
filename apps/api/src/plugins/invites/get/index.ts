import { prisma } from "@hominem/db";
import type { FastifyInstance } from "fastify";

import { verifySession } from "../../auth/utils";

const getUserInvitesRoute = (server: FastifyInstance) => {
	server.get(
		"/invites",
		{
			preValidation: verifySession,
			schema: {
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
								list: {
									type: "object",
									properties: {
										id: { type: "string" },
										name: { type: "string" },
									},
								},
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
			const { userId } = request.session.get("data");
			const currentUser = await prisma.user.findUnique({
				where: { id: userId },
			});
			const invites = await prisma.listInvite.findMany({
				where: {
					OR: [
						{ invitedUserId: userId },
						{ invitedUserEmail: currentUser?.email },
					],
				},
				include: {
					list: {
						select: {
							name: true,
							id: true,
						},
					},
					user: {
						select: {
							email: true,
							name: true,
						},
					},
				},
				orderBy: { listId: "asc" },
			});

			return reply.status(200).send(invites);
		},
	);

	server.get(
		"/invites/outgoing",
		{
			preValidation: verifySession,
			schema: {
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
			const { userId } = request.session.get("data");
			const invites = await prisma.listInvite.findMany({
				where: { userId },
			});

			return reply.status(200).send(invites);
		},
	);
};

export default getUserInvitesRoute;
