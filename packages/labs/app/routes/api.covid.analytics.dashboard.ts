import type { LoaderFunctionArgs } from "react-router";
import { fetchCovidData } from "~/lib/public-data";

interface Summary {
  total_cases: number;
  total_deaths: number;
  total_vaccinations: number;
  population: number;
  case_fatality_rate: number;
  vaccination_rate: number;
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
      .filter((r) => r.total_cases !== null)
      .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

    if (sorted.length === 0) {
      return Response.json({ error: "No data found for country", country }, { status: 404 });
    }

    const latest = sorted[0];

    const summary: Summary = {
      total_cases: latest.total_cases || 0,
      total_deaths: latest.total_deaths || 0,
      total_vaccinations: latest.total_vaccinations || 0,
      population: latest.population || 0,
      case_fatality_rate:
        latest.total_cases && latest.total_deaths
          ? (latest.total_deaths / latest.total_cases) * 100
          : 0,
      vaccination_rate:
        latest.population && latest.total_vaccinations
          ? (latest.total_vaccinations / latest.population) * 100
          : 0,
    };

    const metrics = {
      new_cases: toNumber(latest.new_cases),
      new_deaths: toNumber(latest.new_deaths),
      new_vaccinations: toNumber(latest.new_vaccinations),
      positive_rate: toNumber(latest.positive_rate),
      reproduction_rate: toNumber(latest.reproduction_rate),
      icu_patients_per_million: toNumber(latest.icu_patients_per_million),
    };

    const last30 = sorted.slice(0, 30).reverse();
    const trends = last30.map((row) => ({
      date: row.date || "",
      new_cases: toNumber(row.new_cases),
      new_deaths: toNumber(row.new_deaths),
      new_vaccinations: toNumber(row.new_vaccinations),
      positive_rate: toNumber(row.positive_rate),
    }));

    const calcTrend = (data: number[]) => {
      if (data.length < 7) return 0;
      const recent = data.slice(-7).reduce((a, b) => a + b, 0) / 7;
      const previous = data.slice(-14, -7).reduce((a, b) => a + b, 0) / 7;
      return previous > 0 ? ((recent - previous) / previous) * 100 : 0;
    };

    const caseTrend = calcTrend(trends.map((t) => t.new_cases));
    const deathTrend = calcTrend(trends.map((t) => t.new_deaths));
    const vaccinationTrend = calcTrend(trends.map((t) => t.new_vaccinations));

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
