import { MetricCard } from "@ponti-studios/ui/data-display";
import { SectionIntro } from "@ponti-studios/ui/layout";
import { Button } from "@ponti-studios/ui/primitives";
import { Link, useLoaderData, type LoaderFunctionArgs } from "react-router";

import { requireRealiteaAdmin } from "~/lib/realitea/admin/auth";
import { loadAdminOverview } from "~/lib/realitea/admin/inventory";

import { GenerationsList, InventoryList } from "./inventory-list";

import "../realitea.css";

const DEFAULT_GAME = "rhobh";

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
            <Link to={`/games/realitea/admin/generate?game=${overview.game.slug}`}>
              Generate
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
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-medium">Inventory</h2>
            <p className="text-muted-foreground text-sm">
              Published puzzles. Players are signed-in people who started that day — not generations.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to={`/games/realitea/admin/inventory?game=${overview.game.slug}`}>View all</Link>
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
