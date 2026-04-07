import { and, desc, eq, isNotNull } from 'drizzle-orm';
import type { LoaderFunctionArgs } from 'react-router';
import { covidData, db } from '~/db';

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

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const country = searchParams.get('country') || 'OWID_WRL';

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
          error: 'No data found for country',
          country,
        },
        { status: 404 }
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
      newCasesDaily: latest.newCases || 0,
      newDeathsDaily: latest.newDeaths || 0,
      newVaccinationsDaily: latest.newVaccinations || 0,
      testPositivityRate: latest.positiveRate || 0,
      reproductionRate: latest.reproductionRate || 0,
      hospitalOccupancy: latest.icuPatientsPerMillion || 0,
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
      date: row.date || '',
      newCases: row.newCases || 0,
      newDeaths: row.newDeaths || 0,
      newVaccinations: row.newVaccinations || 0,
      testPositivityRate: row.testPositivityRate || 0,
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
          direction: caseTrend > 5 ? 'increasing' : caseTrend < -5 ? 'decreasing' : 'stable',
          percentage: Math.round(caseTrend * 100) / 100,
        },
        deaths: {
          direction: deathTrend > 5 ? 'increasing' : deathTrend < -5 ? 'decreasing' : 'stable',
          percentage: Math.round(deathTrend * 100) / 100,
        },
        vaccinations: {
          direction:
            vaccinationTrend > 5 ? 'increasing' : vaccinationTrend < -5 ? 'decreasing' : 'stable',
          percentage: Math.round(vaccinationTrend * 100) / 100,
        },
      },
    });
  } catch (error) {
    console.error('Error in dashboard analytics:', error);
    return Response.json({ error: 'Failed to load dashboard analytics' }, { status: 500 });
  }
}
