import type { LoaderFunctionArgs } from "react-router";
import { fetchCovidData } from "~/lib/public-data";

interface SeasonalPattern {
  month: number;
  monthName: string;
  averageCases: number;
  averageDeaths: number;
  caseVariance: number;
  deathVariance: number;
}

interface SeasonalAnalysis {
  seasonalityStrength: number;
  peakMonth: number;
  troughMonth: number;
  patterns: SeasonalPattern[];
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const country = url.searchParams.get("country") || "OWID_WRL";

    const data = await fetchCovidData(country);

    if (data.length === 0) {
      return Response.json({ country, error: "No data found for seasonal analysis" });
    }

    const monthlyData: Record<number, { cases: number[]; deaths: number[] }> = {};
    for (let i = 1; i <= 12; i++) monthlyData[i] = { cases: [], deaths: [] };

    for (const row of data) {
      if (row.date) {
        const month = new Date(row.date).getMonth() + 1;
        const cases = row.new_cases_smoothed || row.new_cases || 0;
        const deaths = row.new_deaths_smoothed || row.new_deaths || 0;
        if (cases > 0) monthlyData[month].cases.push(cases);
        if (deaths > 0) monthlyData[month].deaths.push(deaths);
      }
    }

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const patterns: SeasonalPattern[] = [];
    for (let month = 1; month <= 12; month++) {
      const cases = monthlyData[month].cases;
      const deaths = monthlyData[month].deaths;
      const avgCases = cases.length > 0 ? cases.reduce((s, v) => s + v, 0) / cases.length : 0;
      const avgDeaths = deaths.length > 0 ? deaths.reduce((s, v) => s + v, 0) / deaths.length : 0;
      const caseVar =
        cases.length > 1
          ? cases.reduce((s, v) => s + (v - avgCases) ** 2, 0) / (cases.length - 1)
          : 0;
      const deathVar =
        deaths.length > 1
          ? deaths.reduce((s, v) => s + (v - avgDeaths) ** 2, 0) / (deaths.length - 1)
          : 0;
      patterns.push({
        month,
        monthName: monthNames[month - 1],
        averageCases: Math.round(avgCases * 100) / 100,
        averageDeaths: Math.round(avgDeaths * 100) / 100,
        caseVariance: Math.round(caseVar * 100) / 100,
        deathVariance: Math.round(deathVar * 100) / 100,
      });
    }

    const caseAverages = patterns.map((p) => p.averageCases).filter((v) => v > 0);
    let seasonalityStrength = 0;
    let peakMonth = 1;
    let troughMonth = 1;

    if (caseAverages.length > 6) {
      const maxCases = Math.max(...caseAverages);
      const minCases = Math.min(...caseAverages);
      const meanCases = caseAverages.reduce((s, v) => s + v, 0) / caseAverages.length;
      seasonalityStrength = meanCases > 0 ? (maxCases - minCases) / meanCases : 0;
      peakMonth = patterns.findIndex((p) => p.averageCases === maxCases) + 1;
      troughMonth = patterns.findIndex((p) => p.averageCases === minCases) + 1;
    }

    const insightList: { pattern: string; description: string; strength: number }[] = [];
    const winterAvg = [12, 1, 2].reduce((s, m) => s + patterns[m - 1].averageCases, 0) / 3;
    const overallAvg = patterns.reduce((s, p) => s + p.averageCases, 0) / 12;
    if (winterAvg > overallAvg * 1.3) {
      insightList.push({
        pattern: "Winter Surge",
        description: "Higher case rates during winter months (Dec-Feb)",
        strength: Math.round((winterAvg / overallAvg - 1) * 100),
      });
    }
    const summerAvg = [6, 7, 8].reduce((s, m) => s + patterns[m - 1].averageCases, 0) / 3;
    if (summerAvg < overallAvg * 0.7 && overallAvg > 0) {
      insightList.push({
        pattern: "Summer Low",
        description: "Lower case rates during summer months (Jun-Aug)",
        strength: Math.round((1 - summerAvg / overallAvg) * 100),
      });
    }

    return Response.json({
      country,
      analysis: {
        seasonalityStrength: Math.round(seasonalityStrength * 1000) / 1000,
        peakMonth,
        troughMonth,
        patterns,
      } as SeasonalAnalysis,
      insights: insightList,
      dataQuality: {
        totalDataPoints: data.length,
        monthsWithData: patterns.filter((p) => p.averageCases > 0).length,
        averageDataPointsPerMonth: Math.round(data.length / 12),
      },
    });
  } catch (error) {
    console.error("Error in seasonal patterns analysis:", error);
    return Response.json({ error: "Failed to analyze seasonal patterns" }, { status: 500 });
  }
}
