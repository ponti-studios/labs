import sendgrid, { type MailDataRequired } from "@sendgrid/mail";
import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

const {
	SENDGRID_API_KEY,
	SENDGRID_SENDER_EMAIL,
	SENDGRID_SENDER_NAME,
	NODE_ENV,
} = process.env;

const isDev = NODE_ENV === "development";

const emailPlugin: FastifyPluginAsync = async (server) => {
	if (!SENDGRID_API_KEY) {
		console.error(
			"warn",
			"The SENDGRID_API_KEY env var must be set, otherwise the API cannot send emails.",
		);
		process.exit(1);
	}

	// Set SendGrid API key
	sendgrid.setApiKey(SENDGRID_API_KEY);

	server.decorate(
		"sendEmail",
		async (email: string, subject: string, text: string, html: string) => {
			const msg: MailDataRequired = {
				to: email,
				from: {
					email: SENDGRID_SENDER_EMAIL as string,
					name: SENDGRID_SENDER_NAME,
				},
				subject,
				text,
				html,
			};

			// Log the email token in development to not expend SendGrid email quota
			// if (isDev) {
			//   server.log.info(`Email sent to: ${email}: ${text} `);
			// } else {
			try {
				await sendgrid.send(msg);
				server.log.info("Email sent", {
					receiver: email,
					sender: SENDGRID_SENDER_EMAIL,
				});
			} catch (err) {
				server.log.error(
					{ err, email, subject, text, html },
					"Error sending email",
				);
				throw new Error("Error sending email");
			}
			// }
		},
	);

	// Add a server decorator to send emails
	server.decorate("sendEmailToken", async (email: string, token: string) => {
		const msg: MailDataRequired = {
			to: email,
			from: {
				email: SENDGRID_SENDER_EMAIL as string,
				name: SENDGRID_SENDER_NAME,
			},
			subject: "Ponti Studios login token",
			text: `The login token for the API is: ${token}`,
			html: `The login token for the API is: ${token}`,
		};

		// Log the email token in development to not expend SendGrid email quota
		if (isDev) {
			server.log.info(`email token for ${email}: ${token} `);
		} else {
			try {
				await sendgrid.send(msg);
				server.log.info(
					`sending email token to ${email} from ${SENDGRID_SENDER_EMAIL}`,
				);
			} catch (err) {
				server.log.error({ err, email, token }, "Error sending email token");
				throw new Error("Error sending email");
			}
		}
	});
};

export default fp(emailPlugin);
