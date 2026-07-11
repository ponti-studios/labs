import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";
import { AppNavigation } from "@pontistudios/ui";

import type { Route } from "./+types/root";
import "./app.css";
import QueryProvider from "./components/QueryProvider";
import { SymptomProvider } from "./context/symptom-context";

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
  const location = useLocation();
  return (
    <QueryProvider>
      <SymptomProvider>
        <AppNavigation
          brand="Health"
          brandHref="/"
          links={[
            { href: "/", label: "Dashboard" },
            { href: "/symptoms", label: "Symptoms" },
            { href: "/appointments", label: "Appointments" },
            { href: "/hospitals", label: "Hospitals" },
          ]}
          activeHref={location.pathname}
          renderLink={({ href, className, children, onClick }) => (
            <Link key={href} to={href} className={className} onClick={onClick}>
              {children}
            </Link>
          )}
        />
        <main className="flex min-h-screen flex-col pt-24">
          <Outlet />
        </main>
      </SymptomProvider>
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
    <main className="container mx-auto flex min-h-screen items-center justify-center px-4 py-16">
      <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
        <div className="flex flex-col gap-2">
          <div className="text-6xl font-bold text-red-500">{status}</div>
          <h1 className="text-2xl font-bold text-gray-900">{message}</h1>
          <p className="text-gray-600">{details}</p>
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Try Again
          </button>
          <a
            href="/"
            className="rounded-lg bg-gray-200 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-300"
          >
            Go Home
          </a>
        </div>
        {stack && import.meta.env.DEV && (
          <div className="w-full rounded-lg bg-gray-100 p-4 text-left">
            <details className="flex flex-col gap-4">
              <summary className="cursor-pointer font-semibold">Stack Trace</summary>
              <pre className="overflow-x-auto text-xs text-red-600">
                <code>{stack}</code>
              </pre>
            </details>
          </div>
        )}
      </div>
    </main>
  );
}
