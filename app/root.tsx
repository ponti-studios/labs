import { Briefcase, FlaskConical, ScrollText, Wrench } from "lucide-react";
import { useMemo } from "react";

import { Navigation } from "@ponti-studios/ui/navigation";
import { Button } from "@ponti-studios/ui/primitives";
import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
  useNavigation,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { ParticleBackground } from "./components/particle-background";
import { PrefetchProvider } from "./components/prefetch-provider";
import QueryProvider from "./components/QueryProvider";
import { BOOK_CALL_URL } from "./data/studio";
import { getHominemUser } from "./lib/server/hominem-auth";
import { cn } from "./lib/utils";
import { t } from "./translations";

export async function loader({ request }: Route.LoaderArgs) {
  return { user: await getHominemUser(request) };
}

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
  { rel: "icon", href: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
  { rel: "icon", href: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
  { rel: "icon", href: "/favicon.png", type: "image/png" },
  { rel: "apple-touch-icon", href: "/apple-touch-icon.png", type: "image/png" },
  {
    rel: "apple-touch-icon",
    href: "/apple-touch-icon-120x120.png",
    type: "image/png",
    sizes: "120x120",
  },
];

// Icons for the unauthenticated mobile nav grid's non-logo tiles, keyed by href.
const NAV_ICONS: Record<string, typeof Wrench> = {
  "/services": Wrench,
  "/work": Briefcase,
  "/projects": FlaskConical,
  "/manifesto": ScrollText,
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <Meta />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,340..900;1,9..144,340..900&display=swap"
        />
        <Links />
        <PrefetchProvider />
      </head>
      <body className="bg-background text-foreground flex min-h-svh flex-col overflow-x-hidden overflow-y-auto font-sans">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { user } = useLoaderData<typeof loader>();
  const location = useLocation();
  const navigation = useNavigation();
  const isNavigating = navigation.state !== "idle";
  const isAuthenticated = user !== null;
  const navLinks = useMemo<
    Array<
      | { href: string; label: string; isExternal?: false; logo?: string }
      | { href: string; label: string; isExternal: true; logo: string }
    >
  >(() => {
    if (isAuthenticated) {
      return [
        { href: "/games/what", label: t.nav.what, logo: "/experiments/logo.what.png" },
        {
          href:
            import.meta.env.NODE_ENV === "development"
              ? "https://localhost:4451"
              : "https://career.ponti.io",
          label: t.nav.career,
          isExternal: true,
          logo: "/experiments/logo.career.500x500.webp",
        },
      ];
    }

    return [
      { href: "/services", label: t.nav.services },
      { href: "/work", label: t.nav.work },
      { href: "/projects", label: t.nav.projects },
      { href: "/manifesto", label: t.nav.manifesto },
    ];
  }, [isAuthenticated]);

  return (
    <QueryProvider>
      <ParticleBackground
        className="fixed"
        enabled={!location.pathname.startsWith("/games/what")}
      />
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
      <Navigation ariaLabel="Primary navigation" variant="nokia">
        <Navigation.Brand>
          <Link to="/" className="flex items-center">
            <img src="/logo.ponti.png" alt={t.nav.brandAlt} className="size-6" />
          </Link>
        </Navigation.Brand>

        <Navigation.List className="grid! grid-cols-3 gap-3 sm:flex! sm:grid-cols-none sm:gap-1">
          {navLinks.map((link) => {
            const isExternalLink = "isExternal" in link && link.isExternal;
            const logo = "logo" in link ? link.logo : undefined;
            const isActive =
              !isExternalLink &&
              (link.href === location.pathname ||
                (link.href !== "/" && location.pathname.startsWith(`${link.href}/`)));

            const content = logo ? (
              <>
                <img
                  src={logo}
                  alt={link.label}
                  className="border-nokia-ink size-6 contrast-125 grayscale sm:border-0 sm:contrast-100 sm:grayscale-0"
                />
                <span className="font-nokia mt-1 block text-base tracking-widest uppercase sm:sr-only">
                  {link.label}
                </span>
              </>
            ) : (
              (() => {
                const Icon = NAV_ICONS[link.href];
                return (
                  <>
                    <span className="border-nokia-ink flex size-10 items-center justify-center border-2 sm:hidden">
                      {Icon && <Icon className="size-5" strokeWidth={2} aria-hidden="true" />}
                    </span>
                    <span className="font-nokia mt-1 block text-base tracking-widest uppercase sm:hidden">
                      {link.label}
                    </span>
                    <span className="hidden sm:inline">{link.label}</span>
                  </>
                );
              })()
            );

            const tileClassName = cn(
              "group flex !h-auto !max-h-none w-full flex-col items-center justify-center gap-0.5 rounded-none border-2 border-transparent px-2 py-3 text-center transition-colors duration-100 sm:!h-9 sm:!max-h-9 sm:flex-row sm:justify-center sm:gap-1.5 sm:rounded-md sm:px-2 sm:py-1.5",
              "active:bg-nokia-ink active:text-nokia-screen sm:active:bg-transparent sm:active:text-inherit",
              isActive
                ? "border-nokia-ink bg-nokia-ink text-nokia-screen sm:bg-muted sm:ring-border sm:border-transparent sm:text-inherit sm:ring-1"
                : "border-nokia-ink/40 sm:border-transparent",
            );

            if (isExternalLink) {
              return (
                <Navigation.Item key={link.href} asChild active={false} className={tileClassName}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full flex-col items-center sm:flex-row"
                  >
                    {content}
                  </a>
                </Navigation.Item>
              );
            }

            return (
              <Navigation.Item key={link.href} asChild active={isActive} className={tileClassName}>
                <Link
                  to={link.href}
                  prefetch="intent"
                  className="flex w-full flex-col items-center sm:flex-row"
                >
                  {content}
                </Link>
              </Navigation.Item>
            );
          })}

          {!isAuthenticated && (
            <Navigation.Action>
              <Button
                asChild
                className="press border-nokia-ink bg-nokia-ink font-nokia text-nokia-screen hover:bg-nokia-ink/90 sm:bg-primary sm:text-primary-foreground sm:hover:bg-primary/90 rounded-none border-2 text-lg tracking-widest uppercase sm:rounded-md sm:border-0 sm:font-sans sm:text-sm sm:tracking-normal sm:normal-case"
              >
                <a href={BOOK_CALL_URL} target="_blank" rel="noreferrer">
                  {t.nav.book}
                </a>
              </Button>
            </Navigation.Action>
          )}
        </Navigation.List>
      </Navigation>
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
          <a href="/" className="bg-card rounded-lg px-4 py-2 text-gray-800">
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
