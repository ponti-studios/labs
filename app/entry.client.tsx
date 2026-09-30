import * as Sentry from "@sentry/react-router";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

const dsn = import.meta.env.VITE_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_SENTRY_RELEASE,
    integrations: [Sentry.reactRouterTracingIntegration()],
    tracesSampleRate: 0.1,
    tracePropagationTargets: [/^\//],
  });
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter
        instrumentations={dsn ? [Sentry.createSentryClientInstrumentation()] : []}
        onError={dsn ? Sentry.sentryOnError : undefined}
      />
    </StrictMode>,
  );
});
