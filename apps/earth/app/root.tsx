import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useNavigation,
} from "react-router";
import { MarketingNav } from "@pontistudios/ui";
import "./app.css";
import BottomSheet from "./components/BottomSheet";
import MapLibreViewer from "./components/MapLibreViewer";
import SheetSkeleton from "./components/SheetSkeleton";
import { queryClient } from "./lib/query-client";

function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <>{children}</>;
}

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
  const navigation = useNavigation();
  const isNavigating = navigation.state === "loading";

  return (
    <QueryClientProvider client={queryClient}>
      <div className="earth-shell">
        <ClientOnly>
          <MapLibreViewer />
        </ClientOnly>
        <MarketingNav
          brand="Earth"
          brandHref="/"
          links={[{ href: "/tfl", label: "TFL" }]}
          activeHref={location.pathname.startsWith("/tfl") ? "/tfl" : location.pathname}
          renderLink={({ href, className, children }) => (
            <Link key={href} to={href} className={className}>
              {children}
            </Link>
          )}
        />
        <BottomSheet>
          {isNavigating ? <SheetSkeleton /> : <Outlet />}
        </BottomSheet>
      </div>
    </QueryClientProvider>
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
