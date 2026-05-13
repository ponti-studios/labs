import { and, desc, eq, isNotNull } from "@pontistudios/db";
import type { LoaderFunctionArgs } from "react-router";
import { covidData, db } from "@pontistudios/db";

interface DashboardSummary {
  totalCases: number;
  totalDeaths: number;
  totalVaccinations: number;
  population: number;
  caseFatalityRate: number;
  vaccinationRate: number;
}

interface DashboardMetrics {
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
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const country = searchParams.get("country") || "OWID_WRL";

    // Get latest summary data
    const latestData = await db
      .select()
      .from(covidData)
      .where(and(eq(covidData.isoCode, country), isNotNull(covidData.totalCases)))
      .orderBy(desc(covidData.date))
      .limit(1);

    if (latestData.length === 0) {
      return Response.json(
        {
          error: "No data found for country",
          country,
        },
        { status: 404 },
      );
    }

    const latest = latestData[0];

    // Calculate summary metrics
    const summary: DashboardSummary = {
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

    // Get current metrics (daily values)
    const metrics: DashboardMetrics = {
      newCasesDaily: toNumber(latest.newCases),
      newDeathsDaily: toNumber(latest.newDeaths),
      newVaccinationsDaily: toNumber(latest.newVaccinations),
      testPositivityRate: toNumber(latest.positiveRate),
      reproductionRate: toNumber(latest.reproductionRate),
      hospitalOccupancy: toNumber(latest.icuPatientsPerMillion),
    };

    // Get 30-day trend data
    const trendData = await db
      .select({
        date: covidData.date,
        newCases: covidData.newCases,
        newDeaths: covidData.newDeaths,
        newVaccinations: covidData.newVaccinations,
        testPositivityRate: covidData.positiveRate,
      })
      .from(covidData)
      .where(eq(covidData.isoCode, country))
      .orderBy(desc(covidData.date))
      .limit(30);

    const trends: TrendData[] = trendData.reverse().map((row) => ({
      date: row.date || "",
      newCases: toNumber(row.newCases),
      newDeaths: toNumber(row.newDeaths),
      newVaccinations: toNumber(row.newVaccinations),
      testPositivityRate: toNumber(row.testPositivityRate),
    }));

    // Calculate trend analysis
    const calculateTrend = (data: number[]) => {
      if (data.length < 7) return 0;
      const recent = data.slice(-7).reduce((a, b) => a + b, 0) / 7;
      const previous = data.slice(-14, -7).reduce((a, b) => a + b, 0) / 7;
      return previous > 0 ? ((recent - previous) / previous) * 100 : 0;
    };

    const caseTrend = calculateTrend(trends.map((t) => t.newCases));
    const deathTrend = calculateTrend(trends.map((t) => t.newDeaths));
    const vaccinationTrend = calculateTrend(trends.map((t) => t.newVaccinations));

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
    console.error("Error in dashboard analytics:", error);
    return Response.json({ error: "Failed to load dashboard analytics" }, { status: 500 });
  }
}
