import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ponti-studios/ui/forms";
import { Spinner } from "@ponti-studios/ui/feedback";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useLoaderData } from "react-router";
import { Badge } from "@ponti-studios/ui/primitives";

interface Outlier {
  date: string;
  value: number;
  metric: string;
  zScore: number;
  type: "spike" | "drop" | "anomaly";
  severity: "low" | "medium" | "high";
  description: string;
}

interface DataQualityIssue {
  date: string;
  issue: string;
  severity: "warning" | "error";
  description: string;
}

interface OutlierResponse {
  country: string;
  metric: string;
  outliers: Outlier[];
  dataQualityIssues: DataQualityIssue[];
  reportingArtifacts: Array<{
    type: string;
    description: string;
    strength: number;
  }>;
  dataQualityScore: number;
  statistics: {
    mean: number;
    standardDeviation: number;
    totalDataPoints: number;
    outliersFound: number;
    qualityIssuesFound: number;
  };
}

export const meta: MetaFunction<typeof loader> = ({ params }) => {
  const countryCode = params.countryCode || "OWID_WRL";
  const countryName = countryCode !== "OWID_WRL" ? countryCode : "World";
  return [
    { title: `Outlier Detection — ${countryName} | Ponti Studios` },
    { name: "description", content: `Outlier detection analysis for ${countryName}.` },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const { countryCode } = params;
  if (!countryCode) throw new Response("Country code is required", { status: 400 });
  return { countryCode };
}

const metrics = [
  { value: "newCasesSmoothed", label: "New Cases (7-day avg)" },
  { value: "newDeathsSmoothed", label: "New Deaths (7-day avg)" },
  { value: "newVaccinations", label: "New Vaccinations" },
  { value: "positiveRate", label: "Test Positivity Rate" },
  { value: "totalCases", label: "Total Cases" },
  { value: "totalDeaths", label: "Total Deaths" },
];

function outlierBadgeVariant(severity: string) {
  if (severity === "high") return "destructive" as const;
  if (severity === "medium") return "secondary" as const;
  return "outline" as const;
}

function issueBadgeVariant(severity: string) {
  return severity === "error" ? ("destructive" as const) : ("secondary" as const);
}

function qualityScoreColor(score: number) {
  if (score >= 0.8) return "text-foreground";
  if (score >= 0.6) return "text-amber-600";
  return "text-red-500";
}

export default function OutlierDetectionPage() {
  const { countryCode } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const [selectedMetric, setSelectedMetric] = useState("newCasesSmoothed");

  const { data, isLoading, isError } = useQuery<OutlierResponse>({
    queryKey: ["outlier-detection", countryCode, selectedMetric],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append("country", countryCode);
      params.append("metric", selectedMetric);
      return fetch(`/api/covid/analytics/outlier-detection?${params}`).then((res) => res.json());
    },
    staleTime: 1000 * 60 * 60,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <label className="ui-data-label">Metric</label>
        <Select value={selectedMetric} onValueChange={setSelectedMetric}>
          <SelectTrigger className="border-border bg-card text-foreground h-7 w-52 rounded text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {metrics.map((metric) => (
              <SelectItem key={metric.value} value={metric.value}>
                {metric.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && <Spinner />}

      {isError && (
        <p className="text-muted-foreground py-4 text-sm">
          Failed to load outlier data. Please try again.
        </p>
      )}

      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="ui-flat-card">
              <p className="ui-data-label mb-2">Data Quality Score</p>
              <p className={`ui-data-value ${qualityScoreColor(data.dataQualityScore)}`}>
                {(data.dataQualityScore * 100).toFixed(1)}%
              </p>
            </div>
            <div className="ui-flat-card">
              <p className="ui-data-label mb-2">Outliers Found</p>
              <p className="ui-data-value">{data.outliers.length}</p>
            </div>
            <div className="ui-flat-card">
              <p className="ui-data-label mb-2">Quality Issues</p>
              <p className="ui-data-value">{data.dataQualityIssues.length}</p>
            </div>
            <div className="ui-flat-card">
              <p className="ui-data-label mb-2">Data Points</p>
              <p className="ui-data-value">{data.statistics.totalDataPoints.toLocaleString()}</p>
            </div>
          </div>

          <div className="ui-flat-card">
            <p className="ui-data-label mb-4">Statistics</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground mb-1 text-xs">Mean Value</p>
                <p className="ui-data-value">{data.statistics.mean.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1 text-xs">Standard Deviation</p>
                <p className="ui-data-value">
                  {data.statistics.standardDeviation.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {data.outliers.length > 0 && (
            <div className="ui-flat-card">
              <p className="ui-data-label mb-3">Detected Outliers</p>
              <div className="max-h-80 space-y-0 overflow-y-auto">
                {data.outliers.map((outlier) => (
                  <div
                    key={`${outlier.date}-${outlier.metric}`}
                    className="border-border flex items-start justify-between gap-4 border-b py-2.5 last:border-0"
                  >
                    <div className="min-w-0">
                      <div className="mb-0.5 flex items-center gap-2">
                        <Badge variant={outlierBadgeVariant(outlier.severity)}>
                          {outlier.severity}
                        </Badge>
                        <span className="text-muted-foreground text-xs capitalize">
                          {outlier.type}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {new Date(outlier.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-muted-foreground truncate text-xs">
                        {outlier.description}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-foreground text-sm font-light tabular-nums">
                        {outlier.value.toLocaleString()}
                      </p>
                      <p className="text-muted-foreground text-xs">z={outlier.zScore}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.dataQualityIssues.length > 0 && (
            <div className="ui-flat-card">
              <p className="ui-data-label mb-3">Data Quality Issues</p>
              <div className="max-h-80 overflow-y-auto">
                {data.dataQualityIssues.map((issue) => (
                  <div
                    key={`${issue.date}-${issue.issue}`}
                    className="border-border flex items-start justify-between gap-4 border-b py-2.5 last:border-0"
                  >
                    <div className="min-w-0">
                      <div className="mb-0.5 flex items-center gap-2">
                        <Badge variant={issueBadgeVariant(issue.severity)}>{issue.severity}</Badge>
                        <span className="text-muted-foreground text-xs">
                          {new Date(issue.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-foreground text-xs">{issue.issue}</p>
                      <p className="text-muted-foreground truncate text-xs">{issue.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.reportingArtifacts.length > 0 && (
            <div className="ui-flat-card">
              <p className="ui-data-label mb-3">Reporting Artifacts</p>
              <div className="divide-border divide-y">
                {data.reportingArtifacts.map((artifact) => (
                  <div key={artifact.type} className="flex items-start justify-between py-2.5">
                    <div>
                      <p className="text-foreground text-sm">{artifact.type}</p>
                      <p className="text-muted-foreground mt-0.5 text-xs">{artifact.description}</p>
                    </div>
                    <span className="text-muted-foreground ml-4 text-sm tabular-nums">
                      {artifact.strength}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.outliers.length === 0 && data.dataQualityIssues.length === 0 && (
            <p className="text-muted-foreground py-4 text-sm">
              No significant outliers or data quality issues detected.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
