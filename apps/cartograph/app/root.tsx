import { isRouteErrorResponse, Links, Meta, Scripts, ScrollRestoration, Outlet, useLocation } from "react-router";
import { useMemo } from "react";
import LeafletViewer from "./components/LeafletViewer";
import Controls from "./components/Controls";
import "./app.css";

export const links = () => [
  { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
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
      <body className="dark">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const location = useLocation();

  const currentTab = useMemo(() => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    if (pathSegments.length > 0) {
      const firstSegment = pathSegments[0];
      if (["covid", "satellites", "tfl", "geospatial"].includes(firstSegment)) {
        return firstSegment;
      }
    }
    return "covid"; // Default tab
  }, [location.pathname]);

  return (
    <div className="earth-shell">
      <LeafletViewer />
      <div className="earth-dock">
        <Controls currentTab={currentTab} />
        <div className="earth-dock-content">
          <Outlet />
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
    <main className="earth-error-shell">
      <div className="earth-error-card">
        <div className="earth-kicker">System exception</div>
        <div className="earth-error-code">{status}</div>
        <h1 className="earth-error-title">{message}</h1>
        <p className="earth-error-copy">{details}</p>

        <div className="earth-error-actions">
          <button
            onClick={() => window.location.reload()}
            className="earth-button earth-button--primary"
          >
            Reload mission
          </button>
          <a href="/" className="earth-button earth-button--secondary">
            Return home
          </a>
        </div>

        {stack && import.meta.env.DEV && (
          <details className="earth-error-stack">
            <summary>Stack trace</summary>
            <pre>
              <code>{stack}</code>
            </pre>
          </details>
        )}
      </div>
    </main>
  );
}
