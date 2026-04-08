import { and, eq, gte, sql } from 'drizzle-orm';
import type { LoaderFunctionArgs } from 'react-router';
import { covidData, db } from '~/db';

interface WaveData {
  wave: number;
  startDate: string;
  endDate: string;
  peakDate: string;
  peakValue: number;
  totalCases: number;
  duration: number;
  avgDailyGrowth: number;
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const country = searchParams.get('country') || 'OWID_WRL';
    const metric = searchParams.get('metric') || 'newCasesSmoothed';

    // Get time series data for the country
    const data = await db
      .select({
        date: covidData.date,
        value: sql<number>`${covidData[metric as keyof typeof covidData]}`,
        totalCases: covidData.totalCases,
      })
      .from(covidData)
      .where(
        and(
          eq(covidData.isoCode, country),
          gte(covidData.date, '2020-03-01') // Start from March 2020
        )
      )
      .orderBy(covidData.date);

    if (data.length === 0) {
      return Response.json({ waves: [], error: 'No data found' });
    }

    // Filter out null values and prepare data
    const validData = data
      .filter((d) => d.date && d.value !== null && d.value > 0)
      .map((d) => ({
        date: d.date as string,
        value: d.value,
        totalCases: d.totalCases || 0,
      }));

    if (validData.length < 7) {
      return Response.json({
        waves: [],
        error: 'Insufficient data for wave analysis',
      });
    }

    // Apply 7-day smoothing if not already smoothed
    const smoothedData = metric.includes('Smoothed') ? validData : applySmoothing(validData);

    // Detect waves using peak detection algorithm
    const waves = detectWaves(smoothedData, metric);

    return Response.json({
      country,
      metric,
      waves,
      totalDataPoints: validData.length,
    });
  } catch (error) {
    console.error('Error in pandemic waves analysis:', error);
    return Response.json({ error: 'Failed to analyze pandemic waves' }, { status: 500 });
  }
}

function applySmoothing(data: Array<{ date: string; value: number; totalCases: number }>) {
  const smoothed = [];

  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - 3);
    const end = Math.min(data.length - 1, i + 3);

    let sum = 0;
    let count = 0;

    for (let j = start; j <= end; j++) {
      sum += data[j].value;
      count++;
    }

    smoothed.push({
      ...data[i],
      value: sum / count,
    });
  }

  return smoothed;
}

function detectWaves(
  data: Array<{ date: string; value: number; totalCases: number }>,
  metric: string
): WaveData[] {
  if (data.length < 21) return []; // Need at least 3 weeks of data

  const waves: WaveData[] = [];
  const minWaveDuration = 14; // Minimum 2 weeks
  const minPeakValue = calculateDynamicThreshold(data);

  let waveNumber = 1;
  let i = 0;

  while (i < data.length - minWaveDuration) {
    // Find start of wave (significant increase)
    const waveStart = findWaveStart(data, i, minPeakValue);
    if (waveStart === -1) break;

    // Find peak of wave
    const peak = findWavePeak(data, waveStart);
    if (peak === -1 || data[peak].value < minPeakValue) {
      i = waveStart + 1;
      continue;
    }

    // Find end of wave
    const waveEnd = findWaveEnd(data, peak);
    if (waveEnd === -1 || waveEnd - waveStart < minWaveDuration) {
      i = peak + 1;
      continue;
    }

    // Calculate wave statistics
    const waveData = data.slice(waveStart, waveEnd + 1);
    const totalCases = waveData.reduce((sum, d) => sum + d.value, 0);
    const duration = waveEnd - waveStart + 1;

    // Calculate average daily growth rate
    const avgDailyGrowth = calculateAverageGrowthRate(waveData);

    waves.push({
      wave: waveNumber++,
      startDate: data[waveStart].date,
      endDate: data[waveEnd].date,
      peakDate: data[peak].date,
      peakValue: Math.round(data[peak].value),
      totalCases: Math.round(totalCases),
      duration,
      avgDailyGrowth: Math.round(avgDailyGrowth * 10000) / 10000, // Round to 4 decimal places
    });

    i = waveEnd + 1;
  }

  return waves;
}

function calculateDynamicThreshold(data: Array<{ value: number }>): number {
  const values = data.map((d) => d.value);
  const sorted = values.sort((a, b) => a - b);
  const q75 = sorted[Math.floor(sorted.length * 0.75)];
  const median = sorted[Math.floor(sorted.length * 0.5)];

  // Threshold is 25% above median, but at least 50% of 75th percentile
  return Math.max(median * 1.25, q75 * 0.5);
}

function findWaveStart(
  data: Array<{ value: number }>,
  startIndex: number,
  threshold: number
): number {
  for (let i = startIndex; i < data.length - 7; i++) {
    // Look for significant increase over a week
    const current = data[i].value;
    const future = data[i + 7]?.value || 0;

    if (current > threshold * 0.3 && future > current * 1.5) {
      return i;
    }
  }
  return -1;
}

function findWavePeak(data: Array<{ value: number }>, startIndex: number): number {
  let maxValue = data[startIndex].value;
  let peakIndex = startIndex;

  for (let i = startIndex; i < Math.min(data.length, startIndex + 90); i++) {
    if (data[i].value > maxValue) {
      maxValue = data[i].value;
      peakIndex = i;
    }

    // If we've been declining for 2 weeks after a peak, consider it the end
    if (i > peakIndex + 14 && data[i].value < maxValue * 0.7) {
      break;
    }
  }

  return peakIndex;
}

function findWaveEnd(data: Array<{ value: number }>, peakIndex: number): number {
  const peakValue = data[peakIndex].value;
  const threshold = peakValue * 0.3; // Wave ends when it drops to 30% of peak

  for (let i = peakIndex + 7; i < Math.min(data.length, peakIndex + 120); i++) {
    if (data[i].value <= threshold) {
      // Confirm decline by checking next few days
      let confirmDecline = true;
      for (let j = i; j < Math.min(data.length, i + 7); j++) {
        if (data[j].value > threshold * 1.5) {
          confirmDecline = false;
          break;
        }
      }
      if (confirmDecline) return i;
    }
  }

  return Math.min(data.length - 1, peakIndex + 90);
}

function calculateAverageGrowthRate(waveData: Array<{ value: number }>): number {
  if (waveData.length < 2) return 0;

  let totalGrowth = 0;
  let validDays = 0;

  for (let i = 1; i < waveData.length; i++) {
    const prev = waveData[i - 1].value;
    const curr = waveData[i].value;

    if (prev > 0) {
      totalGrowth += (curr - prev) / prev;
      validDays++;
    }
  }

  return validDays > 0 ? totalGrowth / validDays : 0;
}
