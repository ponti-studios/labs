// Simple browser fingerprinting function
export const generateFingerprint = (): string => {
	if (typeof window === "undefined") {
		// Fallback for server-side rendering or environments without window
		return `server-fingerprint-${Date.now()}-${Math.random()}`;
	}
	const screenData = `${window.screen.width},${window.screen.height},${window.screen.colorDepth}`;
	const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	const languages = navigator.languages?.join(",") || navigator.language;
	const platform = navigator.platform;
	const fingerprint = `${screenData}-${timezone}-${languages}-${platform}`;
	try {
		return btoa(fingerprint); // Base64 encode to make it a bit more opaque
	} catch (e) {
		// Fallback for environments where btoa might not be available or fails (e.g., some Node.js versions without polyfills)
		return `fallback-fingerprint-${fingerprint.replace(/[^a-zA-Z0-9]/g, "")}`;
	}
};
