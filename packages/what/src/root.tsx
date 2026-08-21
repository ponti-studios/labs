import { useEffect } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import { BRAND_NAME, BRAND_TAGLINE } from "./config/brand";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <title>{BRAND_NAME}</title>
        <meta name="description" content={BRAND_TAGLINE} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={BRAND_NAME} />
        <meta property="og:description" content={BRAND_TAGLINE} />
        <meta property="og:image" content="/logo.png" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={BRAND_NAME} />
        <meta name="twitter:description" content={BRAND_TAGLINE} />
        <meta name="twitter:image" content="/logo.png" />
        <meta name="theme-color" content="#f5b400" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" type="image/png" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js", { scope: "/" });
    }
  }, []);

  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let status = 500;
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    details =
      typeof error.data === "string"
        ? error.data
        : error.status === 404
          ? "The requested page could not be found."
          : error.statusText || details;
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main style={{ textAlign: "center", padding: "2rem" }}>
      <p style={{ fontSize: "1.5rem", fontWeight: 700 }}>{status}</p>
      <p style={{ opacity: 0.7 }}>{details}</p>
      <a href="/">Back home</a>
      {stack && import.meta.env.DEV && (
        <pre style={{ textAlign: "left", overflowX: "auto" }}>
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
