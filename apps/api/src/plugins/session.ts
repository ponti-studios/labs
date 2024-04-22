import assert from "node:assert";
import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

const { COOKIE_DOMAIN, COOKIE_NAME, COOKIE_SECRET, COOKIE_SALT } = process.env;

assert(COOKIE_DOMAIN, "The COOKIE_DOMAIN is missing.");
assert(COOKIE_NAME, "The COOKIE_NAME is missing.");
assert(COOKIE_SECRET, "The COOKIE_SECRET is missing.");
assert(COOKIE_SALT, "The COOKIE_SALT is missing.");

const sessionPlugin: FastifyPluginAsync = async (server) => {
	server.register(require("@fastify/secure-session"), {
		cookieName: COOKIE_NAME, // Defaults to `session`
		secret: COOKIE_SECRET,
		salt: COOKIE_SALT,
		// options for setCookie, see https://github.com/fastify/fastify-cookie
		// The API and UI are not hosted at the same domain.
		// Setting 'sameSite' to none and 'secure' to true enables the application cookie
		// to be used on domains other than the API's domain. The API only accepts requests
		// from the UI domain so we can safely set these values.
		cookie: {
			maxAge: 60 * 60 * 24 * 7,
			domain: COOKIE_DOMAIN,
			httpOnly: true,
			sameSite: "lax",
			secure: true,
		},
	});
};

export default fp(sessionPlugin);
