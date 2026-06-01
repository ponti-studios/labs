"use client";

import { CountUpTo, MetricCard } from "@pontistudios/ui";
import type { CovidDataRecord } from "~/types/covid";

interface StatsOverviewProps {
  data: CovidDataRecord[];
  countryCode: string;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function formatCompact(val: number): string {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
  return val.toLocaleString();
}

export function StatsOverview({ data, countryCode: _countryCode }: StatsOverviewProps) {
  const latestData = data && data.length > 0 ? data[0] : null;

  if (!latestData) {
    return <p className="text-sm text-stone-400">No data available.</p>;
  }

  const stats = [
    { label: "Total Cases", value: latestData.totalCases, change: latestData.newCasesSmoothed },
    { label: "Total Deaths", value: latestData.totalDeaths, change: latestData.newDeathsSmoothed },
    {
      label: "Fully Vaccinated",
      value: latestData.peopleFullyVaccinated,
      change: latestData.newVaccinationsSmoothed,
    },
    { label: "Cases per Million", value: latestData.totalCasesPerMillion },
  ];

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ label, value, change }) => {
          const num = toNumber(value);
          const changeNum = toNumber(change);
          return (
            <MetricCard
              key={label}
              label={label}
              value={num !== null ? <CountUpTo value={num} /> : null}
              change={
                changeNum !== null
                  ? `${changeNum >= 0 ? "+" : ""}${formatCompact(changeNum)} daily`
                  : undefined
              }
            />
          );
        })}
      </div>
      {latestData.date && (
        <p className="text-xs text-stone-400">
          Data as of {new Date(latestData.date).toLocaleDateString()}
          {latestData.vaccinationDataDate &&
            latestData.vaccinationDataDate !== latestData.date && (
              <>
                {" "}
                · Vaccination data as of{" "}
                {new Date(latestData.vaccinationDataDate).toLocaleDateString()}
              </>
            )}
        </p>
      )}
    </div>
  );
}
