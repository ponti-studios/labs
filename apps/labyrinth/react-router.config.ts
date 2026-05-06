import type { Config } from "@react-router/dev/config";

export default {
	// Config options...
	// Server-side render by default, to enable SPA mode set this to `false`
	// For Fly.io deployment, we can use SSR
	ssr: true,
} satisfies Config;
