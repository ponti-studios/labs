import { ParticleBackground } from "@pontistudios/ui";

type RouteEntry = {
  path: string;
  href?: string;
  kind: "page" | "api" | "dynamic";
};

const routeEntries: RouteEntry[] = [
  { path: "/", href: "/", kind: "page" },
  { path: "/svg-glass-test", href: "/svg-glass-test", kind: "page" },
  { path: "/api/director/generate", kind: "api" },
  { path: "/api/words/validate", kind: "api" },
  { path: "/infinite-scroll", href: "/infinite-scroll", kind: "page" },
  { path: "/tarot", href: "/tarot", kind: "page" },
  { path: "/api/tarot", kind: "api" },
  { path: "/covid", href: "/covid", kind: "page" },
  //   { path: "/covid/:countryCode", kind: "dynamic" },
  //   { path: "/covid/:countryCode/pandemic-waves", kind: "dynamic" },
  //   { path: "/covid/:countryCode/vaccination-effectiveness", kind: "dynamic" },
  //   { path: "/covid/:countryCode/seasonal-patterns", kind: "dynamic" },
  //   { path: "/covid/:countryCode/outlier-detection", kind: "dynamic" },
  { path: "/games/tetris", href: "/games/tetris", kind: "page" },
  { path: "/games/realitea", href: "/games/realitea", kind: "page" },
  { path: "/business-tools", href: "/business-tools", kind: "page" },
  { path: "/business-tools/marketing", href: "/business-tools/marketing", kind: "page" },
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

  { path: "/challenges/cards", href: "/challenges/cards", kind: "page" },
  { path: "/challenges/anagrams", href: "/challenges/anagrams", kind: "page" },
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
    <section className="relative mx-auto flex min-h-[calc(100vh-7rem)] w-full items-start justify-center">
      <ParticleBackground />
      <div className="w-full rounded-2xl border border-border bg-background p-6 sm:p-8">
        <header className="mb-8 space-y-2 font-mono">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Labyrinth</p>
          <h1 className="text-2xl text-foreground sm:text-3xl">Available routes</h1>
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
                  className="transition-colors duration-150 hover:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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
