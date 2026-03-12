import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { useEffect } from "react";
import CesiumViewer from "./components/CesiumViewer";
import Controls from "./components/Controls";
import { initializeFromUrl } from "./lib/signals/earth";
import "./app.css";

export const links = () => [
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
        <title>Ponti Studios - Earth</title>
        <Meta />
        <Links />
      </head>
      <body className="bg-bg-app text-text-primary font-sans">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  useEffect(() => {
    initializeFromUrl(window.location.pathname);
  }, []);

  return (
    <div className="h-screen w-screen flex overflow-hidden relative">
      {/* Persistent Cesium Viewer */}
      <CesiumViewer />

      {/* Overlay Panel - route content changes, Cesium stays */}
      <div className="absolute top-0 left-0 w-[400px] h-full z-10 pointer-events-none">
        <div className="h-full pointer-events-auto overflow-y-auto bg-bg-panel-0/95 backdrop-blur-sm border-r border-border-default">
          <Controls />
          <div className="p-4">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: { error?: unknown }) {
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
    <main className="p-4 container mx-auto min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="text-6xl font-bold text-red-500 mb-2">{status}</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{message}</h1>
          <p className="text-gray-600">{details}</p>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
          <a
            href="/"
            className="px-4 py-2 bg-bg-panel-1 text-primary rounded-lg hover:bg-bg-panel-2 transition-colors"
          >
            Go Home
          </a>
        </div>

        {stack && import.meta.env.DEV && (
          <div className="mt-8 text-left">
            <details className="bg-bg-panel-1 rounded-lg p-4">
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
