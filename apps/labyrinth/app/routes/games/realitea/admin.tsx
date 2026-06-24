import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";

import { and, count, db, desc, eq, inArray, rhobhDailyPuzzles } from "@pontistudios/db";

import { requireAdminAuth } from "~/lib/server/admin-auth";
import { addDaysToDateKey, getPuzzleWindow } from "~/lib/realitea-puzzle";
import { getPublishedPuzzle } from "~/lib/realitea-puzzle.server";

async function getInventoryDepth(fromDateKey: string, days: number): Promise<number> {
  const dateKeys: string[] = [];
  for (let i = 1; i <= days; i++) {
    const key = addDaysToDateKey(fromDateKey, i);
    if (key) dateKeys.push(key);
  }
  if (dateKeys.length === 0) return 0;
  const rows = await db
    .select({ value: count() })
    .from(rhobhDailyPuzzles)
    .where(
      and(
        eq(rhobhDailyPuzzles.status, "scheduled"),
        inArray(rhobhDailyPuzzles.scheduledForDateKey, dateKeys),
      ),
    );
  return rows[0]?.value ?? 0;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const denied = requireAdminAuth(request);
  if (denied) return denied;

  const now = new Date();
  const window = getPuzzleWindow(now);

  const [published, statusCounts, recentPuzzles, inventoryDepth] = await Promise.all([
    getPublishedPuzzle(now),
    db
      .select({ status: rhobhDailyPuzzles.status, value: count() })
      .from(rhobhDailyPuzzles)
      .groupBy(rhobhDailyPuzzles.status),
    db.query.rhobhDailyPuzzles.findMany({
      orderBy: desc(rhobhDailyPuzzles.createdAt),
      limit: 14,
    }),
    getInventoryDepth(window.dateKey, 7),
  ]);

  const byStatus = Object.fromEntries(statusCounts.map((r) => [r.status, r.value]));
  const totalPuzzles = statusCounts.reduce((sum, r) => sum + r.value, 0);
  const isHealthy = !!published && inventoryDepth >= 2 && totalPuzzles > 0;

  return {
    health: isHealthy ? "OK" : "DEGRADED",
    checkedAt: now.toISOString(),
    dateKey: window.dateKey,
    publishWindow: {
      publishAt: window.publishAt.toISOString(),
      expireAt: window.expireAt.toISOString(),
    },
    puzzle: published
      ? {
          id: published.id,
          dateKey: published.scheduledForDateKey,
          answerType: published.answerType,
          clue: published.clue,
        }
      : null,
    inventory: {
      depth: inventoryDepth,
      scheduled: byStatus["scheduled"] ?? 0,
      published: byStatus["published"] ?? 0,
      consumed: byStatus["consumed"] ?? 0,
      total: totalPuzzles,
    },
    recent: recentPuzzles.map((p) => ({
      id: p.id,
      dateKey: p.scheduledForDateKey,
      status: p.status,
      answerType: p.answerType,
      createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
    })),
  };
}

type LoaderData = Exclude<Awaited<ReturnType<typeof loader>>, Response>;

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  published: "bg-green-100 text-green-800",
  consumed: "bg-gray-100 text-gray-600",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[status] ?? "bg-yellow-100 text-yellow-800"}`}>
      {status}
    </span>
  );
}

function HealthBadge({ health }: { health: string }) {
  const ok = health === "OK";
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${ok ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
      {health}
    </span>
  );
}

export default function RealiTeaAdmin() {
  const data = useLoaderData() as LoaderData;
  const { health, checkedAt, dateKey, publishWindow, puzzle, inventory, recent } = data;

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6 font-sans">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">RealiTea — Admin Dashboard</h1>
        <HealthBadge health={health} />
      </div>

      <p className="text-sm text-gray-500">
        Checked at {new Date(checkedAt).toLocaleString()} · Active date: <strong>{dateKey}</strong>
      </p>

      {/* Publish window */}
      <section>
        <h2 className="mb-2 text-lg font-semibold">Today's Publish Window</h2>
        <div className="grid grid-cols-2 gap-4 rounded-lg border p-4 text-sm">
          <div>
            <p className="text-gray-500">Publishes at</p>
            <p className="font-mono">{new Date(publishWindow.publishAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-500">Expires at</p>
            <p className="font-mono">{new Date(publishWindow.expireAt).toLocaleString()}</p>
          </div>
        </div>
      </section>

      {/* Active puzzle */}
      <section>
        <h2 className="mb-2 text-lg font-semibold">Active Puzzle</h2>
        {puzzle ? (
          <div className="rounded-lg border p-4 text-sm">
            <p className="text-gray-500">ID #{puzzle.id} · {puzzle.dateKey} · <em>{puzzle.answerType}</em></p>
            <p className="mt-1 font-medium">{puzzle.clue}</p>
          </div>
        ) : (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            No published puzzle for the current window.
          </div>
        )}
      </section>

      {/* Inventory */}
      <section>
        <h2 className="mb-2 text-lg font-semibold">Inventory</h2>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Scheduled (next 7d)", value: inventory.depth },
            { label: "Scheduled (total)", value: inventory.scheduled },
            { label: "Published", value: inventory.published },
            { label: "Consumed", value: inventory.consumed },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg border p-4 text-center">
              <p className="text-2xl font-bold">{value}</p>
              <p className="mt-1 text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
        {inventory.depth < 3 && (
          <p className={`mt-2 text-sm font-medium ${inventory.depth === 0 ? "text-red-600" : "text-yellow-600"}`}>
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
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Date Key</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recent.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono text-gray-500">#{p.id}</td>
                  <td className="px-4 py-2 font-mono">{p.dateKey ?? "—"}</td>
                  <td className="px-4 py-2">
                    <StatusBadge status={p.status} />
                  </td>
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
