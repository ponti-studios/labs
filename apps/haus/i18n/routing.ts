import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
	// A list of all locales that are supported
	locales: ["en"],

	// Used when no locale matches
	defaultLocale: "en",

	// The `as-needed` strategy will only show the locale prefix
	// when a non-default locale is active.
	localePrefix: "as-needed",
});

/**
 * Lightweight wrappers around Next.js' navigation APIs
 * that will consider the routing configuration.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
	createNavigation(routing);
