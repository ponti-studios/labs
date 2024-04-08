import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

const { COOKIE_NAME, COOKIE_SECRET, COOKIE_SALT } = process.env;

const sessionPlugin: FastifyPluginAsync = async (server) => {
	server.register(require("@fastify/secure-session"), {
		cookieName: COOKIE_NAME, // the name of the session cookie, defaults to 'session'
		secret: COOKIE_SECRET,
		salt: COOKIE_SALT,
		// options for setCookie, see https://github.com/fastify/fastify-cookie
		// The API and UI are not hosted at the same domain.
		// Setting 'sameSite' to none and 'secure' to true enables the application cookie
		// to be used on domains other than the API's domain. The API only accepts requests
		// from the UI domain so we can safely set these values.
		cookie: {
			maxAge: 60 * 60 * 24 * 7,
			httpOnly: true,
			sameSite: "lax",
			secure: true,
		},
	});
};

export default fp(sessionPlugin);
