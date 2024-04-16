import type { FastifyInstance, FastifyPluginAsync } from "fastify";

import { APP_USER_ID, EVENTS, track } from "../../../analytics";
import { createToken } from "./createToken";

interface LoginInput {
	email: string;
}

const loginPlugin: FastifyPluginAsync = async (server) => {
	/**
	 * Login/Registration handler
	 *
	 * Because there are no passwords, the same endpoint is used for login and registration.
	 * Generates a short lived verification token and sends an email
	 */
	server.post(
		"/login",
		{
			schema: {
				body: {
					email: { type: "string" },
				},
			},
		},
		async (request, reply) => {
			const { email } = request.body as LoginInput;

			try {
				await createToken({ email, server });
				return reply.code(200).send();
			} catch (error) {
				const message = (error as Error)?.message;
				request.log.error(message);
				track(APP_USER_ID, EVENTS.USER_EVENTS.REGISTER_FAILURE, { message });
				return reply.code(500).send({ message: "Could not create account" });
			}
		},
	);
}

export default loginPlugin;