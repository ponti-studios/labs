import { MetricCard } from "@ponti-studios/ui/data-display";
import { SectionIntro } from "@ponti-studios/ui/layout";
import { Button, Card, CardContent, StatusBadge, type StatusBadgeConfig } from "@ponti-studios/ui/primitives";
import { Link, useLoaderData, type LoaderFunctionArgs } from "react-router";

import { requireRealiteaAdmin } from "~/lib/realitea/admin/auth";
import { loadAdminOverview, type InventoryCellState } from "~/lib/realitea/admin/inventory";

import "../realitea.css";

const DEFAULT_GAME = "rhobh";

const CELL_STATUS: Record<InventoryCellState, StatusBadgeConfig> = {
  live: { label: "Live", variant: "default" },
  ready: { label: "Ready", variant: "outline" },
  missing: { label: "Missing", variant: "secondary" },
};

export function meta() {
  return [{ title: "RealiTea admin" }, { name: "robots", content: "noindex" }];
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requireRealiteaAdmin(request, "loader");

  const slug = new URL(request.url).searchParams.get("game") ?? DEFAULT_GAME;
  const overview = await loadAdminOverview(slug);
  if (!overview) {
    throw Response.json({ error: `No active RealiTea topic found` }, { status: 404 });
  }
  return overview;
}

export default function RealiTeaAdminOverview() {
  const overview = useLoaderData<typeof loader>();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-6">
      <SectionIntro
        eyebrow="Operator console"
        title={overview.game.name}
        description={`UTC today ${overview.utcToday} · PT today ${overview.pacificToday}`}
        actions={
          <Button asChild>
            <Link to={`/games/realitea/admin/preview?game=${overview.game.slug}`}>
              Try generation
            </Link>
          </Button>
        }
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="Inventory depth" value={overview.inventoryDepth} />
        <MetricCard label="Pending articles" value={overview.pendingArticles} />
        <MetricCard
          label="UTC today puzzle"
          value={overview.todayPuzzlePresent ? "Ready" : "Missing"}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Inventory</h2>
        <ol className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {overview.cells.map((cell) => (
            <li key={cell.dateKey}>
              <Link
                to={`/games/realitea/admin/dates/${cell.dateKey}?game=${overview.game.slug}`}
                className="block"
              >
                <Card className="hover:bg-muted/40 transition-colors">
                  <CardContent className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">{cell.dateKey}</p>
                      <p className="text-muted-foreground text-xs">
                        {cell.isUtcToday ? "UTC today" : cell.isPacificToday ? "PT today" : "Scheduled"}
                        {cell.attemptCount > 0 ? ` · ${cell.attemptCount} attempts` : ""}
                      </p>
                    </div>
                    <StatusBadge status={cell.state} config={CELL_STATUS} />
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
