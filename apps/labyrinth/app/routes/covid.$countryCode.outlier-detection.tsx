import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useLoaderData } from "react-router";
import {
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
} from "@pontistudios/ui";

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
  if (severity === "high") return "error" as const;
  if (severity === "medium") return "warning" as const;
  return "muted" as const;
}

function issueBadgeVariant(severity: string) {
  return severity === "error" ? ("error" as const) : ("warning" as const);
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
          <SelectTrigger className="w-52 h-7 text-xs border-border bg-card text-foreground rounded">
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
        <p className="text-sm text-muted-foreground py-4">
          Failed to load outlier data. Please try again.
        </p>
      )}

      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
                <p className="text-xs text-muted-foreground mb-1">Mean Value</p>
                <p className="ui-data-value">{data.statistics.mean.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Standard Deviation</p>
                <p className="ui-data-value">
                  {data.statistics.standardDeviation.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {data.outliers.length > 0 && (
            <div className="ui-flat-card">
              <p className="ui-data-label mb-3">Detected Outliers</p>
              <div className="space-y-0 max-h-80 overflow-y-auto">
                {data.outliers.map((outlier) => (
                  <div
                    key={`${outlier.date}-${outlier.metric}`}
                    className="flex items-start justify-between gap-4 py-2.5 border-b border-border last:border-0"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Badge variant={outlierBadgeVariant(outlier.severity)}>
                          {outlier.severity}
                        </Badge>
                        <span className="text-xs text-muted-foreground capitalize">
                          {outlier.type}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(outlier.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{outlier.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-light text-foreground tabular-nums">
                        {outlier.value.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">z={outlier.zScore}</p>
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
                    className="flex items-start justify-between gap-4 py-2.5 border-b border-border last:border-0"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Badge variant={issueBadgeVariant(issue.severity)}>{issue.severity}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(issue.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-foreground">{issue.issue}</p>
                      <p className="text-xs text-muted-foreground truncate">{issue.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.reportingArtifacts.length > 0 && (
            <div className="ui-flat-card">
              <p className="ui-data-label mb-3">Reporting Artifacts</p>
              <div className="divide-y divide-border">
                {data.reportingArtifacts.map((artifact) => (
                  <div key={artifact.type} className="flex items-start justify-between py-2.5">
                    <div>
                      <p className="text-sm text-foreground">{artifact.type}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{artifact.description}</p>
                    </div>
                    <span className="text-sm text-muted-foreground tabular-nums ml-4">
                      {artifact.strength}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.outliers.length === 0 && data.dataQualityIssues.length === 0 && (
            <p className="text-sm text-muted-foreground py-4">
              No significant outliers or data quality issues detected.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
