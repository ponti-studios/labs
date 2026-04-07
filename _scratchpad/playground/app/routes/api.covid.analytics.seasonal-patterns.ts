import { eq } from 'drizzle-orm';
import type { LoaderFunctionArgs } from 'react-router';
import { covidData, db } from '~/db';

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
    const searchParams = url.searchParams;
    const country = searchParams.get('country') || 'OWID_WRL';

    // Get all available data for the country
    const data = await db
      .select({
        date: covidData.date,
        newCases: covidData.newCases,
        newDeaths: covidData.newDeaths,
        newCasesSmoothed: covidData.newCasesSmoothed,
        newDeathsSmoothed: covidData.newDeathsSmoothed,
      })
      .from(covidData)
      .where(eq(covidData.isoCode, country))
      .orderBy(covidData.date);

    if (data.length === 0) {
      return Response.json({
        country,
        error: 'No data found for seasonal analysis',
      });
    }

    // Group data by month and calculate averages
    const monthlyData: Record<number, { cases: number[]; deaths: number[] }> = {};

    for (let i = 1; i <= 12; i++) {
      monthlyData[i] = { cases: [], deaths: [] };
    }

    for (const row of data) {
      if (row.date) {
        const month = new Date(row.date).getMonth() + 1; // 1-12
        const cases = row.newCasesSmoothed || row.newCases || 0;
        const deaths = row.newDeathsSmoothed || row.newDeaths || 0;

        if (cases > 0) monthlyData[month].cases.push(cases);
        if (deaths > 0) monthlyData[month].deaths.push(deaths);
      }
    }

    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    // Calculate patterns for each month
    const patterns: SeasonalPattern[] = [];

    for (let month = 1; month <= 12; month++) {
      const cases = monthlyData[month].cases;
      const deaths = monthlyData[month].deaths;

      const averageCases =
        cases.length > 0 ? cases.reduce((sum, val) => sum + val, 0) / cases.length : 0;

      const averageDeaths =
        deaths.length > 0 ? deaths.reduce((sum, val) => sum + val, 0) / deaths.length : 0;

      // Calculate variance
      const caseVariance =
        cases.length > 1
          ? cases.reduce((sum, val) => sum + (val - averageCases) ** 2, 0) / (cases.length - 1)
          : 0;

      const deathVariance =
        deaths.length > 1
          ? deaths.reduce((sum, val) => sum + (val - averageDeaths) ** 2, 0) / (deaths.length - 1)
          : 0;

      patterns.push({
        month,
        monthName: monthNames[month - 1],
        averageCases: Math.round(averageCases * 100) / 100,
        averageDeaths: Math.round(averageDeaths * 100) / 100,
        caseVariance: Math.round(caseVariance * 100) / 100,
        deathVariance: Math.round(deathVariance * 100) / 100,
      });
    }

    // Calculate seasonality metrics
    const caseAverages = patterns.map((p) => p.averageCases).filter((avg) => avg > 0);
    const deathAverages = patterns.map((p) => p.averageDeaths).filter((avg) => avg > 0);

    let seasonalityStrength = 0;
    let peakMonth = 1;
    let troughMonth = 1;

    if (caseAverages.length > 6) {
      // Need at least 6 months of data
      const maxCases = Math.max(...caseAverages);
      const minCases = Math.min(...caseAverages);
      const meanCases = caseAverages.reduce((sum, val) => sum + val, 0) / caseAverages.length;

      // Seasonality strength as coefficient of variation
      seasonalityStrength = meanCases > 0 ? (maxCases - minCases) / meanCases : 0;

      // Find peak and trough months
      peakMonth = patterns.findIndex((p) => p.averageCases === maxCases) + 1;
      troughMonth = patterns.findIndex((p) => p.averageCases === minCases) + 1;
    }

    // Detect common seasonal patterns
    const detectPatterns = (patterns: SeasonalPattern[]) => {
      const insights = [];

      // Winter surge pattern (Dec, Jan, Feb high)
      const winterMonths = [12, 1, 2];
      const winterAvg =
        winterMonths.reduce((sum, month) => sum + patterns[month - 1].averageCases, 0) / 3;
      const overallAvg = patterns.reduce((sum, p) => sum + p.averageCases, 0) / 12;

      if (winterAvg > overallAvg * 1.3) {
        insights.push({
          pattern: 'Winter Surge',
          description: 'Higher case rates during winter months (Dec-Feb)',
          strength: Math.round((winterAvg / overallAvg - 1) * 100),
        });
      }

      // Summer low pattern (Jun, Jul, Aug low)
      const summerMonths = [6, 7, 8];
      const summerAvg =
        summerMonths.reduce((sum, month) => sum + patterns[month - 1].averageCases, 0) / 3;

      if (summerAvg < overallAvg * 0.7 && overallAvg > 0) {
        insights.push({
          pattern: 'Summer Low',
          description: 'Lower case rates during summer months (Jun-Aug)',
          strength: Math.round((1 - summerAvg / overallAvg) * 100),
        });
      }

      return insights;
    };

    const patternInsights = detectPatterns(patterns);

    const analysis: SeasonalAnalysis = {
      seasonalityStrength: Math.round(seasonalityStrength * 1000) / 1000,
      peakMonth,
      troughMonth,
      patterns,
    };

    return Response.json({
      country,
      analysis,
      insights: patternInsights,
      dataQuality: {
        totalDataPoints: data.length,
        monthsWithData: patterns.filter((p) => p.averageCases > 0).length,
        averageDataPointsPerMonth: Math.round(data.length / 12),
      },
    });
  } catch (error) {
    console.error('Error in seasonal patterns analysis:', error);
    return Response.json({ error: 'Failed to analyze seasonal patterns' }, { status: 500 });
  }
}
