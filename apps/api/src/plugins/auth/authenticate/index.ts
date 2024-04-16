import { TokenType, prisma } from "@hominem/db";
import { add } from "date-fns";
import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import { APP_USER_ID, EVENTS, track } from "../../../analytics";

interface AuthenticateInput {
	email: string;
	emailToken: string;
}

export const TOKEN_FAILURE_REASONS = {
	EXPIRED: "expired",
	INVALID: "token_invalid",
	NOT_FOUND: "token_not_found",
	EMAIL_MISMATCH: "email_mismatch",
} as const;

const AUTHENTICATION_TOKEN_EXPIRATION_HOURS = 12;

const authenticatePlugin: FastifyPluginAsync = async (server) => {
	server.post(
		"/authenticate",
		{
			schema: {
				body: {
					email: { type: "string" },
					emailToken: { type: "string" },
				},
			},
		},
		async (request, reply) => {
			// 👇 get the email and emailToken from the request payload
			const { email, emailToken } = request.body as AuthenticateInput;

			// Get short lived email token
			const fetchedEmailToken = await prisma.token.findUnique({
				where: {
					emailToken,
				},
				include: {
					user: true,
				},
			});

			if (!fetchedEmailToken) {
				// If the token doesn't exist, return 400 bad request
				reply.log.error("Login token does not exist");
				track(APP_USER_ID, EVENTS.USER_EVENTS.EMAIL_TOKEN_VALIDATED_FAILURE, {
					reason: TOKEN_FAILURE_REASONS.NOT_FOUND,
				});
				return reply.code(400).send("Invalid token");
			}

			if (!fetchedEmailToken.valid) {
				request.session.delete();
				// If the token doesn't exist or is not valid, return 401 unauthorized
				reply.log.error("Login token is not valid");
				track(APP_USER_ID, EVENTS.USER_EVENTS.EMAIL_TOKEN_VALIDATED_FAILURE, {
					reason: TOKEN_FAILURE_REASONS.INVALID,
				});
				return reply.code(401).send();
			}

			if (fetchedEmailToken.expiration < new Date()) {
				request.session.delete();
				// If the token has expired, return 401 unauthorized
				reply.log.error("Login token has expired");
				track(APP_USER_ID, EVENTS.USER_EVENTS.EMAIL_TOKEN_VALIDATED_FAILURE, {
					reason: TOKEN_FAILURE_REASONS.EXPIRED,
				});
				return reply.code(401).send("Token expired");
			}

			if (fetchedEmailToken.user?.email !== email) {
				request.session.delete();
				// If token doesn't match the email passed in the payload, return 401 unauthorized
				reply.log.error("Token email does not match email");
				track(APP_USER_ID, EVENTS.USER_EVENTS.EMAIL_TOKEN_VALIDATED_FAILURE, {
					reason: TOKEN_FAILURE_REASONS.EMAIL_MISMATCH,
				});
				return reply.code(401).send();
			}

			let user = await prisma.user.findUnique({ where: { email } });

			if (!user) {
				user = await prisma.user.create({
					data: {
						email,
					},
				});
			}

			const tokenBase = {
				isAdmin: user.isAdmin,
				roles: ["user", !!user.isAdmin && "admin"].filter(Boolean),
				userId: user.id,
			};
			const accessToken = server.jwt.sign(tokenBase);

			// Create a unique refresh token
			const refreshToken = crypto.randomUUID();

			const [createdToken] = await prisma.$transaction([
				prisma.token.create({
					data: {
						type: TokenType.API,
						accessToken,
						refreshToken,
						expiration: add(new Date(), {
							hours: AUTHENTICATION_TOKEN_EXPIRATION_HOURS,
						}),
						user: {
							connect: {
								email,
							},
						},
					},
					include: {
						user: true,
					},
				}),
				// Invalidate the email token after it's been used
				prisma.token.update({
					where: {
						id: fetchedEmailToken.id,
					},
					data: {
						valid: false,
					},
				}),
			]);

			const { id: userId, isAdmin, name } = createdToken.user;
			const responseUser = {
				...tokenBase,
				name,
			};

			track(userId, EVENTS.USER_EVENTS.LOGIN_SUCCESS, { isAdmin });

			request.session.set("data", responseUser);

			return reply
				.code(200)
				.send({ user: responseUser })
				.headers({
					Authorization: `Bearer ${accessToken}`,
				});
		},
	);
}

export default authenticatePlugin;