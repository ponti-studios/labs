import type { Config } from "@react-router/dev/config";
import { sentryOnBuildEnd } from "@sentry/react-router";

const hasSentryBuildConfig = Boolean(
  process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT,
);

const config: Config = {
  ssr: true,
  ...(hasSentryBuildConfig ? { buildEnd: sentryOnBuildEnd } : {}),
};

export default config;
