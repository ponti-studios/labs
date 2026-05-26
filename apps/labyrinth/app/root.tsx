import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { PrefetchProvider } from "./components/prefetch-provider";
import QueryProvider from "./components/QueryProvider";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap",
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
        <PrefetchProvider />
      </head>
      <body className="bg-background text-foreground font-sans">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <QueryProvider>
      <div className="border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <a href="/" className="text-lg font-semibold text-foreground">
              Labyrinth
            </a>
          </div>
        </div>
      </div>
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </QueryProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let status = 500;
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    details =
      error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="text-6xl font-bold text-red-500 mb-2">{status}</div>
          <p className="text-gray-600">{details}</p>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg "
          >
            Try Again
          </button>
          <a href="/" className="px-4 py-2 bg-secondary text-gray-800 rounded-lg">
            Go Home
          </a>
        </div>

        {stack && import.meta.env.DEV && (
          <div className="mt-8 text-left">
            <details className="bg-gray-100 rounded-lg p-4">
              <summary className="font-semibold cursor-pointer">Stack Trace</summary>
              <pre className="mt-4 text-xs overflow-x-auto text-red-600">
                <code>{stack}</code>
              </pre>
            </details>
          </div>
        )}
      </div>
    </main>
  );
}
