export const isProd = process.env.NODE_ENV === "production";
export const isLocal = process.env.NODE_ENV === "development";
export const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
export const SHOW_LOGGER = isLocal
	? true
	: process.env.NEXT_PUBLIC_SHOW_LOGGER === "true" || false;
