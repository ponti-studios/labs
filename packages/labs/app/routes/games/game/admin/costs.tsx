import { MetricCard } from "@ponti-studios/ui/data-display";
import { SectionIntro } from "@ponti-studios/ui/layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ponti-studios/ui/data-display";
import { EmptyState } from "@ponti-studios/ui/feedback";
import { Button } from "@ponti-studios/ui/primitives";
import { Link, useLoaderData } from "react-router";

import { formatTokenCount, formatUsd } from "~/lib/game/admin/format";
import {
  getGenerationCostReport,
  type GenerationCostBreakdownRow,
} from "~/lib/game/server/generation-runs.server";

import { BRAND_NAME } from "~/config/brand";

import "~/components/games/game.css";

export function meta() {
  return [{ title: `${BRAND_NAME} generation cost` }, { name: "robots", content: "noindex" }];
}

export async function loader() {
  const report = await getGenerationCostReport({ sinceDays: 30 });
  return report;
}

function BreakdownTable({
  title,
  rows,
  emptyLabel,
}: {
  title: string;
  rows: GenerationCostBreakdownRow[];
  emptyLabel: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-medium">{title}</h2>
      {rows.length === 0 ? (
        <EmptyState title={emptyLabel} description="No generation runs in this window." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{title}</TableHead>
              <TableHead>Runs</TableHead>
              <TableHead>Tokens</TableHead>
              <TableHead>Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.key ?? "unknown"}>
                <TableCell className="font-medium">{row.key ?? "unknown"}</TableCell>
                <TableCell className="text-muted-foreground">{row.count}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatTokenCount(row.totalTokens)}
                </TableCell>
                <TableCell className="text-muted-foreground">{formatUsd(row.costUsd)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  );
}

export default function GameAdminCosts() {
  const report = useLoaderData<typeof loader>();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-6">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link to="/games/game/admin">← Admin</Link>
      </Button>

      <SectionIntro
        title="Generation cost"
        description={`All generation runs across every topic — last ${report.sinceDays} days.`}
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="Total runs" value={report.totalRuns} />
        <MetricCard label="Total tokens" value={formatTokenCount(report.totalTokens)} />
        <MetricCard label="Total cost" value={formatUsd(report.totalCostUsd)} />
      </section>

      <BreakdownTable title="Trigger" rows={report.byTrigger} emptyLabel="No triggers" />
      <BreakdownTable
        title="Environment"
        rows={report.byEnvironment}
        emptyLabel="No environments"
      />
      <BreakdownTable title="Model" rows={report.byModel} emptyLabel="No models" />
    </main>
  );
}
