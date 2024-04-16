import { TokenType, prisma } from "@hominem/db";
import { add } from "date-fns";
import type { FastifyInstance } from "fastify";

import { APP_USER_ID, EVENTS, track } from "../../../analytics";
import { sendEmailToken } from "../../email";

const EMAIL_TOKEN_EXPIRATION_MINUTES = 10;

// Generate a random 8 digit number as the email token
function generateEmailToken(): string {
	return Math.floor(10000000 + Math.random() * 90000000).toString();
}

async function createToken({
	email,
	server,
}: {
	email: string;
	server: FastifyInstance;
}) {
	// 👇 Generate an alphanumeric token
	const emailToken = generateEmailToken();
	// 👇 Create a date object for the email token expiration
	const tokenExpiration = add(new Date(), {
		minutes: EMAIL_TOKEN_EXPIRATION_MINUTES,
	});

	let tokenCreateParams:
		| { connect: { email: string } }
		| { create: { email: string } };
	const user = await prisma.user.findUnique({
		where: { email },
	});

	if (user) {
		tokenCreateParams = {
			connect: {
				email,
			},
		};
	} else {
		tokenCreateParams = {
			create: {
				email,
			},
		};
	}

	// 👇 create a short lived token and update user or create if they don't exist
	const token = await prisma.token.create({
		data: {
			emailToken,
			type: TokenType.EMAIL,
			expiration: tokenExpiration,
			user: tokenCreateParams,
		},
	});

	if (!user) {
		// 👇 create a list for the new user
		await prisma.list.create({
			data: {
				name: "General",
				userId: token.userId,
			},
		});
	}

	track(APP_USER_ID, EVENTS.USER_EVENTS.REGISTER_SUCCESS, {});

	try {
		// 👇 Send the email token
		await sendEmailToken(email, emailToken);
	} catch (error) {
		server.log.error("Error sending email token", error);
		throw new Error("Error sending email token");
	}
}

export { createToken };
