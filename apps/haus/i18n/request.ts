import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

/**
 * i18n Request Configuration
 * This configuration is executed on every request. It resolves the locale
 * and loads the corresponding messages.
 */
export default getRequestConfig(async ({ locale, requestLocale }) => {
	// To ensure robustness across different Next.js and next-intl versions,
	// we check both the direct 'locale' parameter and the 'requestLocale' promise.
	let finalLocale = locale || (await requestLocale);

	// Validate that the resolved locale is supported by our routing configuration.
	// If not, we fall back to the default locale.
	if (!finalLocale || !routing.locales.includes(finalLocale as any)) {
		finalLocale = routing.defaultLocale;
	}

	return {
		locale: finalLocale,
		messages: (await import(`../messages/${finalLocale}.json`)).default,
	};
});
