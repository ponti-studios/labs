import { MetricCard } from "@ponti-studios/ui/data-display";
import { SectionIntro } from "@ponti-studios/ui/layout";
import { Button } from "@ponti-studios/ui/primitives";
import { Link, useLoaderData, type LoaderFunctionArgs } from "react-router";

import { formatUsd } from "~/lib/admin/format";
import { loadAdminOverview } from "~/lib/admin/inventory";
import { DEFAULT_GAME_SLUG } from "~/lib/generation/catalog";

import { GenerationsList, InventoryList } from "./admin.inventory-list";

import { BRAND_NAME } from "~/config/brand";

import "~/components/game/game.css";

export function meta() {
  return [{ title: `${BRAND_NAME} admin` }, { name: "robots", content: "noindex" }];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const slug = new URL(request.url).searchParams.get("game") ?? DEFAULT_GAME_SLUG;
  const overview = await loadAdminOverview(slug);
  if (!overview) {
    throw Response.json({ error: `No active ${BRAND_NAME} topic found` }, { status: 404 });
  }
  return overview;
}

export default function GameAdminOverview() {
  const overview = useLoaderData<typeof loader>();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-6">
      <SectionIntro
        title={overview.game.name}
        description={`UTC today ${overview.utcToday} · PT today ${overview.pacificToday}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/admin/topics">Articles</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/costs">Costs</Link>
            </Button>
            <Button asChild>
              <Link to={`/admin/generate?game=${overview.game.slug}`}>Generate</Link>
            </Button>
          </div>
        }
      />

      <section className="grid gap-3 sm:grid-cols-4">
        <MetricCard label="Inventory depth" value={overview.inventoryDepth} />
        <MetricCard label="Pending articles" value={overview.pendingArticles} />
        <MetricCard
          label="UTC today puzzle"
          value={overview.todayPuzzlePresent ? "Ready" : "Missing"}
        />
        <MetricCard
          label="Recent generation cost"
          value={formatUsd(overview.recentGenerationCostUsd)}
        />
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-medium">Inventory</h2>
            <p className="text-muted-foreground text-sm">
              Published puzzles. Players are signed-in people who started that day — not
              generations.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to={`/admin/inventory?game=${overview.game.slug}`}>View all</Link>
          </Button>
        </div>
        <InventoryList cells={overview.cells} gameSlug={overview.game.slug} />
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-medium">Generations</h2>
          <p className="text-muted-foreground text-sm">
            One model try for one date. It does not replace the published puzzle.
          </p>
        </div>
        <GenerationsList generations={overview.generations} gameSlug={overview.game.slug} />
      </section>
    </main>
  );
}
