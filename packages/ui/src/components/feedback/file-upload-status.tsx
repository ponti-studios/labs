import { XIcon } from "lucide-react";
import { memo } from "react";

import { cn } from "../../lib/utils";
import { ProgressBar } from "./progress-bar";

export interface FileUploadStats {
  progress?: number;
  processingTime?: number;
  total?: number;
  created?: number;
  updated?: number;
  skipped?: number;
  merged?: number;
  invalid?: number;
  errors?: unknown[];
}

export interface FileUploadState {
  status: "uploading" | "processing" | "queued" | "done" | "error" | (string & {});
  error?: string;
  stats?: FileUploadStats;
}

export const FileUploadStatus = memo(function FileUploadStatus({
  uploadStatus,
}: {
  uploadStatus?: FileUploadState;
}) {
  if (!uploadStatus) return null;
  const { status, error, stats } = uploadStatus;

  if (status === "uploading" || status === "processing") {
    const progress = stats?.progress;

    return (
      <output className="w-full">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-muted-foreground text-sm font-medium">
            {status === "uploading" ? "Uploading" : "Processing"}
          </span>
          <span className="text-foreground text-sm font-medium">
            {progress !== undefined ? `${Math.round(progress)}%` : ""}
          </span>
        </div>
        <div className="w-full">
          {typeof progress === "number" ? (
            <ProgressBar
              progress={progress}
              className={cn("bg-muted h-2", "before:bg-emphasis-high")}
            />
          ) : (
            <div className="bg-muted h-2 overflow-hidden">
              <div className="bg-emphasis-high void-anim-breezy-progress h-full" />
            </div>
          )}
        </div>
      </output>
    );
  }

  if (status === "queued") {
    return (
      <output className="w-full">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-muted-foreground text-sm font-medium">Queue position</span>
        </div>
        <div className="w-full">
          <ProgressBar progress={0} className="bg-warning-subtle before:bg-warning h-2" />
        </div>
      </output>
    );
  }

  if (status === "done") {
    return (
      <output className="space-y-3">
        <div className="w-full">
          <ProgressBar progress={100} className="bg-emphasis-minimal before:bg-emphasis-high h-2" />
        </div>
        {stats && <ProcessingStats stats={stats} />}
      </output>
    );
  }

  if (status === "error") {
    return (
      <output className="mt-2" role="alert">
        <div className="bg-destructive/10 text-destructive flex items-start gap-2 p-3">
          <XIcon className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
          <span className="text-sm">{error}</span>
        </div>
      </output>
    );
  }

  return <output className="text-muted-foreground text-sm">{status}</output>;
});

const ProcessingStats = memo(function ProcessingStats({ stats }: { stats: FileUploadStats }) {
  if (!stats || typeof stats !== "object") return null;

  return (
    <dl className="divide-border mt-3 divide-y">
      {stats.processingTime !== undefined && (
        <div className="py-2 first:pt-0 last:pb-0">
          <dt className="sr-only">Processing time</dt>
          <dd className="text-foreground text-sm font-medium">
            Completed in {(stats.processingTime / 1000).toFixed(1)}s
          </dd>
        </div>
      )}
      {stats.total !== undefined && Object.values(stats).length ? (
        <>
          <ProcessingStat label="Total" value={stats.total} />
          <ProcessingStat label="Created" value={stats.created} />
          <ProcessingStat label="Updated" value={stats.updated} />
          <ProcessingStat label="Skipped" value={stats.skipped} />
          <ProcessingStat label="Merged" value={stats.merged} />
          <ProcessingStat label="Invalid" value={stats.invalid} />
        </>
      ) : null}

      {stats.errors?.length && stats.errors.length > 0 ? (
        <div className="py-2">
          <dt className="text-foreground text-sm font-medium">Errors</dt>
          <dd className="mt-1">
            <span className="bg-destructive/10 text-destructive inline-flex items-center px-2 py-1 text-xs font-medium">
              {stats.errors.length} error{stats.errors.length > 1 ? "s" : ""}
            </span>
          </dd>
        </div>
      ) : null}
    </dl>
  );
});

const ProcessingStat = memo(function ProcessingStat({
  label,
  value,
}: {
  label: string;
  value?: number | undefined;
}) {
  if (value === undefined) return null;
  return (
    <div className="py-2">
      <dt className="text-muted-foreground text-sm font-medium">{label}</dt>
      <dd className="text-foreground mt-1 text-sm">{value.toLocaleString()}</dd>
    </div>
  );
});
