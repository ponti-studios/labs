import { fetchCovidData, type CovidRow } from "~/lib/public-data";
import type { LoaderFunctionArgs } from "react-router";

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

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const country = url.searchParams.get("country") || "OWID_WRL";
    const metric = url.searchParams.get("metric") || "new_cases_smoothed";

    const allRows = await fetchCovidData(country);
    const data = allRows.sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));

    if (data.length === 0) {
      return Response.json({ country, error: "No data found for outlier detection" });
    }

    const values = data
      .map((row) => ({
        date: row.date || "",
        value: (row[metric as keyof CovidRow] ?? 0) as number,
        total_cases: row.total_cases || 0,
        total_deaths: row.total_deaths || 0,
      }))
      .filter((item) => item.value > 0);

    if (values.length < 10) {
      return Response.json({ country, metric, error: "Insufficient data for outlier detection" });
    }

    const calcStats = (vals: number[]) => {
      const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
      const variance = vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length;
      return { mean, stdDev: Math.sqrt(variance) };
    };

    const { mean, stdDev } = calcStats(values.map((v) => v.value));
    const outliers: Outlier[] = [];
    const dataQualityIssues: DataQualityIssue[] = [];

    for (let i = 0; i < values.length; i++) {
      const current = values[i];
      const zScore = stdDev > 0 ? Math.abs(current.value - mean) / stdDev : 0;

      if (zScore > 2.5) {
        const severity: "low" | "medium" | "high" =
          zScore > 3.5 ? "high" : zScore > 3 ? "medium" : "low";
        const type: "spike" | "drop" = current.value > mean ? "spike" : "drop";
        outliers.push({
          date: current.date,
          value: current.value,
          metric,
          zScore: Math.round(zScore * 100) / 100,
          type,
          severity,
          description: `${type === "spike" ? "Unusual spike" : "Unusual drop"} in ${metric} (${zScore.toFixed(1)} sd from mean)`,
        });
      }

      if (i > 0) {
        const prev = values[i - 1];
        const pctChange =
          prev.value > 0 ? Math.abs((current.value - prev.value) / prev.value) * 100 : 0;
        if (pctChange > 500) {
          dataQualityIssues.push({
            date: current.date,
            issue: "Sudden Jump",
            severity: "warning",
            description: `${pctChange.toFixed(0)}% day-over-day change in ${metric}`,
          });
        }
        if ((metric === "total_cases" || metric === "total_deaths") && current.value < prev.value) {
          dataQualityIssues.push({
            date: current.date,
            issue: "Negative Growth",
            severity: "error",
            description: `${metric} decreased from ${prev.value} to ${current.value}`,
          });
        }
      }

      if (i > 30 && i < values.length - 30 && current.value === 0) {
        dataQualityIssues.push({
          date: current.date,
          issue: "Missing Data",
          severity: "warning",
          description: `Zero value for ${metric} in active reporting period`,
        });
      }
    }

    const dayOfWeekValues: Record<number, number[]> = {};
    for (let d = 0; d < 7; d++) dayOfWeekValues[d] = [];
    for (const item of values) {
      dayOfWeekValues[new Date(item.date).getDay()].push(item.value);
    }
    const dayAvgs = Object.values(dayOfWeekValues).map((v) =>
      v.length > 0 ? v.reduce((s, x) => s + x, 0) / v.length : 0,
    );
    const overallAvg = dayAvgs.reduce((s, v) => s + v, 0) / 7;
    const reportingArtifacts: { type: string; description: string; strength: number }[] = [];
    if (overallAvg > 0 && (Math.max(...dayAvgs) - Math.min(...dayAvgs)) / overallAvg > 0.5) {
      reportingArtifacts.push({
        type: "Weekly Reporting Pattern",
        description: "Significant variation in reporting by day of week detected",
        strength: Math.round(((Math.max(...dayAvgs) - Math.min(...dayAvgs)) / overallAvg) * 100),
      });
    }

    let score = 100;
    score -= Math.min(30, outliers.length * 2);
    score -= Math.min(20, dataQualityIssues.filter((q) => q.severity === "error").length * 5);
    score -= Math.min(15, dataQualityIssues.filter((q) => q.severity === "warning").length * 2);
    score -= Math.min(10, reportingArtifacts.length * 5);
    const dataQualityScore = Math.max(0, score) / 100;

    return Response.json({
      country,
      metric,
      outliers: outliers.sort((a, b) => b.zScore - a.zScore),
      dataQualityIssues,
      reportingArtifacts,
      dataQualityScore: Math.round(dataQualityScore * 100) / 100,
      statistics: {
        mean: Math.round(mean * 100) / 100,
        standardDeviation: Math.round(stdDev * 100) / 100,
        totalDataPoints: values.length,
        outliersFound: outliers.length,
        qualityIssuesFound: dataQualityIssues.length,
      },
    });
  } catch (error) {
    console.error("Error in outlier detection:", error);
    return Response.json({ error: "Failed to perform outlier detection" }, { status: 500 });
  }
}
