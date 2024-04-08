import { prisma } from "@hominem/db";
import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { verifySession } from "./auth";

const usersPlugin: FastifyPluginAsync = async (server: FastifyInstance) => {
	server.get(
		"/me",
		{
			preValidation: verifySession,
		},
		async (request, reply) => {
			const session = request.session.get("data");
			try {
				const user = await prisma.user.findUnique({
					where: {
						id: session.userId,
					},
				});

				/**
				 * If user does not exist, then we should delete their
				 * session and return a 401.
				 */
				if (!user) {
					request.session.delete();
					return reply.code(401).send();
				}

				return reply.code(200).send(user);
			} catch (err) {
				request.log.info("Could not fetch user", { err });
				return reply.code(500).send();
			}
		},
	);
};

export default fp(usersPlugin);
