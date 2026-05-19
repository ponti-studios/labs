import {
  isRouteErrorResponse,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import { PrefetchProvider } from "./components/prefetch-provider";
import QueryProvider from "./components/QueryProvider";
import { routes } from "./lib/routes";
import "./app.css";

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
      <body className="bg-bg-app text-text-primary font-body">
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
      <div className="border-b border-border-default bg-bg-panel-0/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <NavLink to="/" className="text-lg font-semibold text-text-primary">
              Tempo
            </NavLink>
            <p className="hidden text-sm text-text-secondary md:block">
              Projects and tasks without sidebar ceremony.
            </p>
          </div>
          <nav aria-label="Primary" className="flex flex-wrap gap-2">
            {routes.map((route) => (
              <NavLink
                key={route.path}
                to={route.path}
                prefetch="intent"
                className={({ isActive }) =>
                  [
                    "rounded-full border px-3 py-2 text-sm transition-colors duration-150",
                    isActive
                      ? "border-border-accent bg-bg-panel-2 text-text-primary"
                      : "border-border-default text-text-secondary hover:bg-bg-panel-1 hover:text-text-primary",
                  ].join(" ")
                }
              >
                {route.label}
              </NavLink>
            ))}
          </nav>
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
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    message = error.status === 404 ? "404" : "Error";
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{message}</h1>
          <p className="text-gray-600">{details}</p>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          <a
            href="/"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
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
