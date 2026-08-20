import { fetchCovidData, type CovidRow } from "~/lib/public-data";
import type { LoaderFunctionArgs } from "react-router";

interface WaveData {
  wave: number;
  start_date: string;
  end_date: string;
  peak_date: string;
  peak_value: number;
  total_cases: number;
  duration: number;
  avg_daily_growth: number;
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const country = url.searchParams.get("country") || "OWID_WRL";
    const metric = url.searchParams.get("metric") || "new_cases_smoothed";

    const allRows = await fetchCovidData(country);
    const data = allRows
      .filter((r) => r.date && r.date >= "2020-03-01")
      .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));

    if (data.length === 0) return Response.json({ waves: [], error: "No data found" });

    const validData = data
      .map((d) => ({
        date: d.date as string,
        value: (d[metric as keyof CovidRow] ?? 0) as number,
        total_cases: d.total_cases || 0,
      }))
      .filter((d) => d.value > 0);

    if (validData.length < 7)
      return Response.json({ waves: [], error: "Insufficient data for wave analysis" });

    const smoothedData = metric.includes("smoothed") ? validData : applySmoothing(validData);
    const waves = detectWaves(smoothedData);

    return Response.json({ country, metric, waves, totalDataPoints: validData.length });
  } catch (error) {
    console.error("Error in pandemic waves analysis:", error);
    return Response.json({ error: "Failed to analyze pandemic waves" }, { status: 500 });
  }
}

function applySmoothing(data: Array<{ date: string; value: number; total_cases: number }>) {
  return data.map((_, i) => {
    const start = Math.max(0, i - 3);
    const end = Math.min(data.length - 1, i + 3);
    let sum = 0,
      count = 0;
    for (let j = start; j <= end; j++) {
      sum += data[j].value;
      count++;
    }
    return { ...data[i], value: sum / count };
  });
}

function detectWaves(
  data: Array<{ date: string; value: number; total_cases: number }>,
): WaveData[] {
  if (data.length < 21) return [];
  const waves: WaveData[] = [];
  const minPeakValue = calculateDynamicThreshold(data);
  const minWaveDuration = 14;
  let waveNumber = 1;
  let i = 0;

  while (i < data.length - minWaveDuration) {
    const waveStart = findWaveStart(data, i, minPeakValue);
    if (waveStart === -1) break;
    const peak = findWavePeak(data, waveStart);
    if (peak === -1 || data[peak].value < minPeakValue) {
      i = waveStart + 1;
      continue;
    }
    const waveEnd = findWaveEnd(data, peak);
    if (waveEnd === -1 || waveEnd - waveStart < minWaveDuration) {
      i = peak + 1;
      continue;
    }
    const waveData = data.slice(waveStart, waveEnd + 1);
    const totalCases = waveData.reduce((s, d) => s + d.value, 0);
    const duration = waveEnd - waveStart + 1;
    const avgDailyGrowth = calculateAverageGrowthRate(waveData);
    waves.push({
      wave: waveNumber++,
      start_date: data[waveStart].date,
      end_date: data[waveEnd].date,
      peak_date: data[peak].date,
      peak_value: Math.round(data[peak].value),
      total_cases: Math.round(totalCases),
      duration,
      avg_daily_growth: Math.round(avgDailyGrowth * 10000) / 10000,
    });
    i = waveEnd + 1;
  }
  return waves;
}

function calculateDynamicThreshold(data: Array<{ value: number }>): number {
  const sorted = data.map((d) => d.value).sort((a, b) => a - b);
  return Math.max(
    sorted[Math.floor(sorted.length * 0.5)] * 1.25,
    sorted[Math.floor(sorted.length * 0.75)] * 0.5,
  );
}

function findWaveStart(
  data: Array<{ value: number }>,
  startIndex: number,
  threshold: number,
): number {
  for (let i = startIndex; i < data.length - 7; i++) {
    const current = data[i].value;
    const future = data[i + 7]?.value || 0;
    if (current > threshold * 0.3 && future > current * 1.5) return i;
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
    if (i > peakIndex + 14 && data[i].value < maxValue * 0.7) break;
  }
  return peakIndex;
}

function findWaveEnd(data: Array<{ value: number }>, peakIndex: number): number {
  const peakValue = data[peakIndex].value;
  const threshold = peakValue * 0.3;
  for (let i = peakIndex + 7; i < Math.min(data.length, peakIndex + 120); i++) {
    if (data[i].value <= threshold) {
      let confirm = true;
      for (let j = i; j < Math.min(data.length, i + 7); j++) {
        if (data[j].value > threshold * 1.5) {
          confirm = false;
          break;
        }
      }
      if (confirm) return i;
    }
  }
  return Math.min(data.length - 1, peakIndex + 90);
}

function calculateAverageGrowthRate(waveData: Array<{ value: number }>): number {
  if (waveData.length < 2) return 0;
  let totalGrowth = 0,
    validDays = 0;
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
