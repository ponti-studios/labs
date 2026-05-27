type RouteEntry = {
  path: string;
  href?: string;
  kind: "page" | "api" | "dynamic";
};

const routeEntries: RouteEntry[] = [
  { path: "/", href: "/", kind: "page" },
  { path: "/svg-glass-test", href: "/svg-glass-test", kind: "page" },
  { path: "/api/director/generate", kind: "api" },
  { path: "/infinite-header", href: "/infinite-header", kind: "page" },
  { path: "/tarot", href: "/tarot", kind: "page" },
  { path: "/api/tarot", kind: "api" },
  { path: "/corona", href: "/corona", kind: "page" },
  { path: "/corona/:countryCode", kind: "dynamic" },
  { path: "/corona/:countryCode/pandemic-waves", kind: "dynamic" },
  { path: "/corona/:countryCode/vaccination-effectiveness", kind: "dynamic" },
  { path: "/corona/:countryCode/seasonal-patterns", kind: "dynamic" },
  { path: "/corona/:countryCode/outlier-detection", kind: "dynamic" },
  { path: "/games/wordle/rhobh", href: "/games/wordle/rhobh", kind: "page" },
  { path: "/experiments", href: "/experiments", kind: "page" },
  {
    path: "/experiments/threegl-web-request",
    href: "/experiments/threegl-web-request",
    kind: "page",
  },
  {
    path: "/experiments/threegl-image-gallery",
    href: "/experiments/threegl-image-gallery",
    kind: "page",
  },
  { path: "/challenges/algorithms", href: "/challenges/algorithms", kind: "page" },
  { path: "/challenges/cards", href: "/challenges/cards", kind: "page" },
  { path: "/challenges/chart-hop", href: "/challenges/chart-hop", kind: "page" },
  { path: "/challenges/click-therapeutics", href: "/challenges/click-therapeutics", kind: "page" },
  { path: "/challenges/cloudmargin", href: "/challenges/cloudmargin", kind: "page" },
  { path: "/challenges/daily-mail", href: "/challenges/daily-mail", kind: "page" },
  { path: "/challenges/goldman-sachs", href: "/challenges/goldman-sachs", kind: "page" },
  { path: "/challenges/growth-street", href: "/challenges/growth-street", kind: "page" },
  { path: "/challenges/interview-cake", href: "/challenges/interview-cake", kind: "page" },
  { path: "/challenges/kensho", href: "/challenges/kensho", kind: "page" },
  { path: "/challenges/peterson-academy", href: "/challenges/peterson-academy", kind: "page" },
  { path: "/challenges/qubit", href: "/challenges/qubit", kind: "page" },
  { path: "/challenges/quilt", href: "/challenges/quilt", kind: "page" },
  { path: "/challenges/red-badger", href: "/challenges/red-badger", kind: "page" },
  { path: "/challenges/vendigo", href: "/challenges/vendigo", kind: "page" },
];

export function meta(): Array<{
  title?: string;
  name?: string;
  content?: string;
}> {
  return [
    { title: "Labyrinth Routes" },
    {
      name: "description",
      content: "A plain-text index of every route currently configured in Labyrinth.",
    },
  ];
}

export default function Home() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-7rem)] w-full items-start justify-center">
      <div className="w-full rounded-2xl border border-border bg-background p-6 sm:p-8">
        <header className="mb-8 space-y-2 font-mono">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Labyrinth</p>
          <h1 className="text-2xl text-foreground sm:text-3xl">Available routes</h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            Every route from the current router config is listed below. Static pages are linked. API
            and dynamic routes are shown as plain text.
          </p>
        </header>

        <ul className="space-y-3 font-mono text-sm text-foreground">
          {routeEntries.map((route) => (
            <li
              key={route.path}
              className="flex min-h-11 items-start justify-between gap-4 border-b border-border/70 pb-3"
            >
              {route.href ? (
                <a
                  href={route.href}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors duration-150 hover:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {route.path}
                </a>
              ) : (
                <span>{route.path}</span>
              )}
              <span className="shrink-0 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {route.kind}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
