import * as React from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  Link,
} from "react-router";

import type { Route } from "./+types/root";
import Providers from "../components/providers";
import { I18nProvider } from "../i18n/client";
import "../styles/globals.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600;700&display=swap",
  },
  { rel: "icon", href: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
  { rel: "icon", href: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
  { rel: "apple-touch-icon", href: "/favicon/apple-icon-180x180.png", sizes: "180x180" },
  { rel: "manifest", href: "/favicon/manifest.json" },
];

export const meta: Route.MetaFunction = () => [
  { title: "Ponti Studios" },
  {
    name: "description",
    content: "A studio that builds, integrates, and designs AI for small, medium, and large businesses.",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
  return (
    <I18nProvider>
      <Providers>
        <Outlet />
      </Providers>
    </I18nProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let status = 500;
  let title = "Unexpected error";
  let details = "An unexpected error occurred.";

  if (isRouteErrorResponse(error)) {
    status = error.status;
    title = error.status === 404 ? "Page not found" : error.statusText || title;
    details = error.status === 404 ? "The route you requested does not exist." : details;
  } else if (error instanceof Error) {
    details = error.message;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          {status}
        </p>
        <h1 className="mt-4 text-4xl font-normal uppercase tracking-[-0.04em]">{title}</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">{details}</p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex rounded-none border border-foreground px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-colors hover:bg-foreground hover:text-background"
          >
            Reload
          </button>
          <Link
            to="/"
            className="inline-flex rounded-none border border-foreground px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-colors hover:bg-foreground hover:text-background"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
