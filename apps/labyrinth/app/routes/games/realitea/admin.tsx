import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";

import { count, dailyPuzzles, db, desc, eq } from "@pontistudios/db";

import { requireAdminAuth } from "~/lib/server/admin-auth";
import { getDateKey } from "~/lib/realitea/date";
import {
  countInventoryForRange,
  countPendingArticlesForGame,
  getGameBySlug,
  loadPuzzleForDate,
} from "~/lib/realitea/repository";

const RHOBH_GAME_SLUG = "rhobh";

export async function loader({ request }: LoaderFunctionArgs) {
  const denied = requireAdminAuth(request);
  if (denied) return denied;

  const now = new Date();
  const dateKey = getDateKey(now);

  const game = await getGameBySlug(RHOBH_GAME_SLUG);
  if (!game) throw new Response(`Game not found: ${RHOBH_GAME_SLUG}`, { status: 500 });

  const [puzzle, totalPuzzles, recentPuzzles, inventoryDepth, pendingArticleDepth] =
    await Promise.all([
      loadPuzzleForDate(game.id, dateKey),
      db
        .select({ value: count() })
        .from(dailyPuzzles)
        .where(eq(dailyPuzzles.gameId, game.id))
        .then((rows) => rows[0]?.value ?? 0),
      db.query.dailyPuzzles.findMany({
        where: eq(dailyPuzzles.gameId, game.id),
        orderBy: desc(dailyPuzzles.createdAt),
        limit: 14,
      }),
      countInventoryForRange(game.id, dateKey, 7),
      countPendingArticlesForGame(game.id),
    ]);

  const isHealthy = !!puzzle && inventoryDepth >= 2 && totalPuzzles > 0;

  return {
    health: isHealthy ? "OK" : "DEGRADED",
    checkedAt: now.toISOString(),
    dateKey,
    puzzle: puzzle
      ? {
          id: puzzle.id,
          dateKey: puzzle.dateUtc,
          answerType: puzzle.answerType,
          clue: puzzle.clue,
        }
      : null,
    inventory: {
      depth: inventoryDepth,
      total: totalPuzzles,
    },
    articleBacklog: {
      pending: pendingArticleDepth,
    },
    recent: recentPuzzles.map((p) => ({
      id: p.id,
      dateKey: p.dateUtc,
      answerType: p.answerType,
      createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
    })),
  };
}

type LoaderData = Exclude<Awaited<ReturnType<typeof loader>>, Response>;

function HealthBadge({ health }: { health: string }) {
  const ok = health === "OK";
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${ok ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
    >
      {health}
    </span>
  );
}

export default function RealiTeaAdmin() {
  const data = useLoaderData() as LoaderData;
  const { health, checkedAt, dateKey, puzzle, inventory, articleBacklog, recent } = data;

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6 font-sans">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">RealiTea — Admin Dashboard</h1>
        <HealthBadge health={health} />
      </div>

      <p className="text-sm text-gray-500">
        Checked at {new Date(checkedAt).toLocaleString()} · Active date: <strong>{dateKey}</strong>
      </p>

      {/* Today's puzzle */}
      <section>
        <h2 className="mb-2 text-lg font-semibold">Today's Puzzle</h2>
        {puzzle ? (
          <div className="rounded-lg border p-4 text-sm">
            <p className="text-gray-500">
              ID #{puzzle.id} · {puzzle.dateKey} · <em>{puzzle.answerType}</em>
            </p>
            <p className="mt-1 font-medium">{puzzle.clue}</p>
          </div>
        ) : (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            No puzzle available for today.
          </div>
        )}
      </section>

      {/* Inventory */}
      <section>
        <h2 className="mb-2 text-lg font-semibold">Inventory</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Puzzles", value: inventory.total },
            { label: "Scheduled (next 7d)", value: inventory.depth },
            { label: "Pending Articles", value: articleBacklog.pending },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg border p-4 text-center">
              <p className="text-2xl font-bold">{value}</p>
              <p className="mt-1 text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
        {inventory.depth < 3 && (
          <p
            className={`mt-2 text-sm font-medium ${inventory.depth === 0 ? "text-red-600" : "text-yellow-600"}`}
          >
            {inventory.depth === 0
              ? "No puzzles scheduled for the next 7 days — run the reconcile script."
              : `Only ${inventory.depth} puzzle(s) scheduled for the next 7 days — inventory is low.`}
          </p>
        )}
      </section>

      {/* Recent puzzles */}
      <section>
        <h2 className="mb-2 text-lg font-semibold">Recent Puzzles</h2>
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Date Key</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recent.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono text-gray-500">#{p.id}</td>
                  <td className="px-4 py-2 font-mono">{p.dateKey ?? "—"}</td>
                  <td className="px-4 py-2 text-gray-600">{p.answerType}</td>
                  <td className="px-4 py-2 text-gray-400">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
