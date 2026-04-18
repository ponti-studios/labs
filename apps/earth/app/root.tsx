import { isRouteErrorResponse, Links, Meta, Scripts, ScrollRestoration } from "react-router";
import CesiumViewer from "./components/CesiumViewer";
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
  return (
    <div className="earth-shell">
      <CesiumViewer />
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
