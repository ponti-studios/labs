import { Link } from "react-router";
import { routes } from "~/lib/routes";

export function meta(): Array<{
  title?: string;
  name?: string;
  content?: string;
}> {
  return [
    { title: "Labyrinth — Playground Index" },
    {
      name: "description",
      content: "Browse the available tools, demos, and experiments directly.",
    },
  ];
}

export default function Home() {
  const featuredRoutes = routes.filter((route) => route.path !== "/");

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <section className="rounded-3xl border border-border bg-background p-6 shadow-sm sm:p-8">
          <div className="max-w-3xl space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Labyrinth
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Open the tool you want and start there.
            </h1>
            <p className="text-base leading-7 text-muted-foreground sm:text-lg">
              The terminal landing page was removed. This app now starts with direct links to the
              actual features.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Available routes</h2>
              <p className="text-sm text-muted-foreground">
                Pick a destination without command syntax or hidden controls.
              </p>
            </div>
            <span className="text-sm text-muted-foreground">{featuredRoutes.length} routes</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featuredRoutes.map((route) => (
              <Link
                key={route.path}
                to={route.path}
                rel="prefetch"
                className="group rounded-2xl border border-border bg-background p-5 transition-colors duration-150 hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-foreground">{route.label}</h3>
                    <p className="text-sm leading-6 text-muted-foreground">{route.description}</p>
                  </div>
                  <span className="text-muted-foreground transition-colors duration-150 group-hover:text-foreground">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
