import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
	matcher: [
		// Enable a redirect to a matching locale at the root
		"/",

		// Set a cookie to remember the last locale for all requests that are not
		// related to API routes, next.js internals or static files
		"/((?!api|_next|_vercel|.*\\..*).*)",
	],
};
