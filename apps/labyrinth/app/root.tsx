import { AppNavigation } from "@ponti-studios/ui/navigation";
import { Button } from "@ponti-studios/ui/primitives";
import { COLOR_MODE_ATTRIBUTE, COLOR_SYSTEM_ATTRIBUTE } from "@ponti-studios/ui/tokens";
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

import type { Route } from "./+types/root";
import "./app.css";
import { ColorSystemToggle } from "./components/color-system-toggle";
import { ParticleBackground } from "./components/particle-background";
import { PrefetchProvider } from "./components/prefetch-provider";
import QueryProvider from "./components/QueryProvider";
import { BOOK_CALL_URL } from "./data/studio";
import { cn } from "./lib/utils";
import { t } from "./translations";

const themeBootScript = `
(() => {
  try {
    const root = document.documentElement;
    const system = "ponti";
    const mode = localStorage.getItem("labs:ui-color-mode") || "system";

    root.setAttribute("${COLOR_SYSTEM_ATTRIBUTE}", system);

    if (mode === "light" || mode === "dark") {
      root.setAttribute("${COLOR_MODE_ATTRIBUTE}", mode);
    } else {
      root.removeAttribute("${COLOR_MODE_ATTRIBUTE}");
    }
  } catch (_error) {
    document.documentElement.setAttribute("${COLOR_SYSTEM_ATTRIBUTE}", "ponti");
    document.documentElement.removeAttribute("${COLOR_MODE_ATTRIBUTE}");
  }
})();
`;

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/logo.realitea.png", type: "image/png" },
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
    <html lang="en" data-color-system="ponti" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <Meta />
        <Links />
        <PrefetchProvider />
      </head>
      <body className="bg-canvas text-primary flex min-h-dvh flex-col overflow-x-hidden overflow-y-auto font-sans">
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
  const isNavigating = navigation.state !== "idle";

  return (
    <QueryProvider>
      <ParticleBackground className="fixed" />
      <div
        aria-hidden="true"
        className={cn(
          "bg-accent fixed inset-x-0 top-0 z-60 h-0.5 origin-left transition-transform duration-200",
          isNavigating ? "scale-x-100" : "scale-x-0",
        )}
      />
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isNavigating ? "Loading page" : ""}
      </div>
      <AppNavigation
        brand={<img src="/logo.ponti.png" alt={t.nav.brandAlt} className="size-6" />}
        brandHref="/"
        links={[
          { href: "/services", label: t.nav.services },
          { href: "/work", label: t.nav.work },
          { href: "/projects", label: t.nav.projects },
          { href: "/manifesto", label: t.nav.manifesto },
        ]}
        activeHref={location.pathname}
        endContent={
          <div className="flex items-center gap-3">
            <Button asChild>
              <a href={BOOK_CALL_URL} target="_blank" rel="noreferrer">
                {t.nav.book}
              </a>
            </Button>
            <ColorSystemToggle />
          </div>
        }
        linkComponent={Link}
        linkProp="to"
        linkProps={{ prefetch: "intent" }}
      />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col">
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
    const routeErrorMessage =
      typeof error.data === "object" &&
      error.data !== null &&
      "error" in error.data &&
      typeof error.data.error === "string"
        ? error.data.error
        : null;
    details =
      routeErrorMessage ??
      (error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details);
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="container mx-auto flex min-h-screen items-center justify-center p-4 pt-16">
      <div className="w-full max-w-md text-center">
        <div className="mb-6">
          <div className="mb-2 text-6xl font-bold text-red-500">{status}</div>
          <p className="text-gray-600">{details}</p>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => window.location.reload()}
            className="bg-accent rounded-lg px-4 py-2 text-white "
          >
            Try Again
          </button>
          <a href="/" className="bg-panel rounded-lg px-4 py-2 text-gray-800">
            Go Home
          </a>
        </div>

        {stack && import.meta.env.DEV && (
          <div className="mt-8 text-left">
            <details className="rounded-lg bg-gray-100 p-4">
              <summary className="cursor-pointer font-semibold">Stack Trace</summary>
              <pre className="mt-4 overflow-x-auto text-xs text-red-600">
                <code>{stack}</code>
              </pre>
            </details>
          </div>
        )}
      </div>
    </main>
  );
}
