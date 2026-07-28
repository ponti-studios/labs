import { fetchCovidData } from "~/lib/public-data";
import type { LoaderFunctionArgs } from "react-router";

interface Summary {
  totalCases: number;
  totalDeaths: number;
  totalVaccinations: number;
  population: number;
  caseFatalityRate: number;
  vaccinationRate: number;
}

interface Metrics {
  newCasesDaily: number;
  newDeathsDaily: number;
  newVaccinationsDaily: number;
  testPositivityRate: number;
  reproductionRate: number;
  hospitalOccupancy: number;
}

interface TrendData {
  date: string;
  newCases: number;
  newDeaths: number;
  newVaccinations: number;
  testPositivityRate: number;
}

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const country = url.searchParams.get("country") || "OWID_WRL";

    const allRows = await fetchCovidData(country);
    const sorted = allRows
      .filter((r) => r.totalCases !== null)
      .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

    if (sorted.length === 0) {
      return Response.json({ error: "No data found for country", country }, { status: 404 });
    }

    const latest = sorted[0];

    const summary: Summary = {
      totalCases: latest.totalCases || 0,
      totalDeaths: latest.totalDeaths || 0,
      totalVaccinations: latest.totalVaccinations || 0,
      population: latest.population || 0,
      caseFatalityRate:
        latest.totalCases && latest.totalDeaths
          ? (latest.totalDeaths / latest.totalCases) * 100
          : 0,
      vaccinationRate:
        latest.population && latest.totalVaccinations
          ? (latest.totalVaccinations / latest.population) * 100
          : 0,
    };

    const metrics: Metrics = {
      newCasesDaily: toNumber(latest.newCases),
      newDeathsDaily: toNumber(latest.newDeaths),
      newVaccinationsDaily: toNumber(latest.newVaccinations),
      testPositivityRate: toNumber(latest.positiveRate),
      reproductionRate: toNumber(latest.reproductionRate),
      hospitalOccupancy: toNumber(latest.icuPatientsPerMillion),
    };

    const last30 = sorted.slice(0, 30).reverse();
    const trends: TrendData[] = last30.map((row) => ({
      date: row.date || "",
      newCases: toNumber(row.newCases),
      newDeaths: toNumber(row.newDeaths),
      newVaccinations: toNumber(row.newVaccinations),
      testPositivityRate: toNumber(row.positiveRate),
    }));

    const calcTrend = (data: number[]) => {
      if (data.length < 7) return 0;
      const recent = data.slice(-7).reduce((a, b) => a + b, 0) / 7;
      const previous = data.slice(-14, -7).reduce((a, b) => a + b, 0) / 7;
      return previous > 0 ? ((recent - previous) / previous) * 100 : 0;
    };

    const caseTrend = calcTrend(trends.map((t) => t.newCases));
    const deathTrend = calcTrend(trends.map((t) => t.newDeaths));
    const vaccinationTrend = calcTrend(trends.map((t) => t.newVaccinations));

    return Response.json({
      country,
      lastUpdated: latest.date,
      summary,
      metrics,
      trends,
      trendAnalysis: {
        cases: {
          direction: caseTrend > 5 ? "increasing" : caseTrend < -5 ? "decreasing" : "stable",
          percentage: Math.round(caseTrend * 100) / 100,
        },
        deaths: {
          direction: deathTrend > 5 ? "increasing" : deathTrend < -5 ? "decreasing" : "stable",
          percentage: Math.round(deathTrend * 100) / 100,
        },
        vaccinations: {
          direction:
            vaccinationTrend > 5 ? "increasing" : vaccinationTrend < -5 ? "decreasing" : "stable",
          percentage: Math.round(vaccinationTrend * 100) / 100,
        },
      },
    });
  } catch (error) {
    console.error("Error in analytics:", error);
    return Response.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
