import { EmptyState } from "@ponti-studios/ui/feedback";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ponti-studios/ui/data-display";
import { StatusBadge, type StatusBadgeConfig } from "@ponti-studios/ui/primitives";
import { Link } from "react-router";

import type { AdminGeneration, InventoryCell, InventoryCellState } from "~/lib/realitea/admin/inventory";

export const CELL_STATUS: Record<InventoryCellState, StatusBadgeConfig> = {
  live: { label: "Live", variant: "default" },
  ready: { label: "Ready", variant: "outline" },
  missing: { label: "Missing", variant: "secondary" },
};

const GENERATION_STATUS: Record<AdminGeneration["status"], StatusBadgeConfig> = {
  running: { label: "Running", variant: "outline" },
  succeeded: { label: "Succeeded", variant: "default" },
  failed: { label: "Failed", variant: "destructive" },
};

function cellWhen(cell: InventoryCell) {
  if (cell.isUtcToday) return "UTC today";
  if (cell.isPacificToday) return "PT today";
  return "Scheduled";
}

export function InventoryList({
  cells,
  gameSlug,
}: {
  cells: InventoryCell[];
  gameSlug: string;
}) {
  if (cells.length === 0) {
    return <EmptyState title="No inventory dates" description="There are no dates in this window." />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>When</TableHead>
          <TableHead>Players</TableHead>
          <TableHead>Puzzle</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cells.map((cell) => (
          <TableRow key={cell.dateKey}>
            <TableCell>
              <Link
                to={`/games/realitea/admin/dates/${cell.dateKey}?game=${gameSlug}`}
                className="text-primary font-medium underline-offset-4 hover:underline"
              >
                {cell.dateKey}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">{cellWhen(cell)}</TableCell>
            <TableCell className="text-muted-foreground">{cell.attemptCount}</TableCell>
            <TableCell>
              <StatusBadge status={cell.state} config={CELL_STATUS} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function GenerationsList({
  generations,
  gameSlug,
}: {
  generations: AdminGeneration[];
  gameSlug: string;
}) {
  if (generations.length === 0) {
    return (
      <EmptyState
        title="No generations"
        description="Generate candidates for a date. A generation is not a player, and it is not the published puzzle."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>When</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Model</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {generations.map((generation) => (
          <TableRow key={generation.id}>
            <TableCell className="whitespace-nowrap">
              <Link
                to={`/games/realitea/admin/generations/${generation.id}?game=${gameSlug}`}
                className="text-primary underline-offset-4 hover:underline"
              >
                {formatGenerationTime(generation.createdAt)}
              </Link>
            </TableCell>
            <TableCell>
              <Link
                to={`/games/realitea/admin/dates/${generation.dateKey}?game=${gameSlug}`}
                className="text-primary underline-offset-4 hover:underline"
              >
                {generation.dateKey}
              </Link>
            </TableCell>
            <TableCell>
              <StatusBadge status={generation.status} config={GENERATION_STATUS} />
            </TableCell>
            <TableCell className="text-muted-foreground">
              {generation.sourceMode}
              {generation.publishable ? "" : " · not publishable"}
              {generation.llmError ? ` · ${generation.llmError}` : ""}
            </TableCell>
            <TableCell className="text-muted-foreground">{generation.model}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function formatGenerationTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
