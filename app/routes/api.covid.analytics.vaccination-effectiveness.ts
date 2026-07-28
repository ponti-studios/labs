import { fetchCovidData } from "~/lib/public-data";
import type { LoaderFunctionArgs } from "react-router";

type VaccinationEffectiveness = {
  overall: number;
  againstHospitalization: number;
  againstDeath: number;
  breakthroughRate: number;
};

interface VaccinationTimeline {
  date: string;
  fully_vaccinated_per_hundred: number;
  new_cases_smoothed: number;
  new_deaths_smoothed: number;
  hosp_patients_per_million: number;
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
    const data = allRows.sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));

    if (data.length === 0) {
      return Response.json({
        country,
        error: "No vaccination data found for country",
        effectiveness: {
          overall: 0,
          againstHospitalization: 0,
          againstDeath: 0,
          breakthroughRate: 0,
        },
        timeline: [],
        milestones: [],
        vaccinationStats: {
          fullyVaccinatedPerHundred: 0,
          totalVaccinations: 0,
          dailyVaccinations: 0,
        },
        totalDataPoints: 0,
      });
    }

    const calculateEffectiveness = (): VaccinationEffectiveness => {
      const preVax = data.filter((d) => toNumber(d.people_fully_vaccinated_per_hundred) < 10);
      const postVax = data.filter((d) => toNumber(d.people_fully_vaccinated_per_hundred) >= 50);

      if (preVax.length === 0 || postVax.length === 0) {
        return { overall: 0, againstHospitalization: 0, againstDeath: 0, breakthroughRate: 0 };
      }

      const preVaxCaseRate =
        preVax.reduce((s, d) => s + toNumber(d.new_cases_smoothed), 0) / preVax.length;
      const postVaxCaseRate =
        postVax.reduce((s, d) => s + toNumber(d.new_cases_smoothed), 0) / postVax.length;
      const preVaxDeathRate =
        preVax.reduce((s, d) => s + toNumber(d.new_deaths_smoothed), 0) / preVax.length;
      const postVaxDeathRate =
        postVax.reduce((s, d) => s + toNumber(d.new_deaths_smoothed), 0) / postVax.length;
      const preVaxHospRate =
        preVax.reduce((s, d) => s + toNumber(d.hosp_patients_per_million), 0) / preVax.length;
      const postVaxHospRate =
        postVax.reduce((s, d) => s + toNumber(d.hosp_patients_per_million), 0) / postVax.length;

      return {
        overall:
          preVaxCaseRate > 0
            ? Math.round(
                Math.max(
                  0,
                  Math.min(100, ((preVaxCaseRate - postVaxCaseRate) / preVaxCaseRate) * 100),
                ) * 100,
              ) / 100
            : 0,
        againstHospitalization:
          preVaxHospRate > 0
            ? Math.round(
                Math.max(
                  0,
                  Math.min(100, ((preVaxHospRate - postVaxHospRate) / preVaxHospRate) * 100),
                ) * 100,
              ) / 100
            : 0,
        againstDeath:
          preVaxDeathRate > 0
            ? Math.round(
                Math.max(
                  0,
                  Math.min(100, ((preVaxDeathRate - postVaxDeathRate) / preVaxDeathRate) * 100),
                ) * 100,
              ) / 100
            : 0,
        breakthroughRate:
          postVaxCaseRate > 0 ? Math.round(Math.min(50, postVaxCaseRate / 10) * 100) / 100 : 0,
      };
    };

    const effectiveness = calculateEffectiveness();

    const timeline: VaccinationTimeline[] = data.map((row) => ({
      date: row.date || "",
      fully_vaccinated_per_hundred: toNumber(row.people_fully_vaccinated_per_hundred),
      new_cases_smoothed: toNumber(row.new_cases_smoothed),
      new_deaths_smoothed: toNumber(row.new_deaths_smoothed),
      hosp_patients_per_million: toNumber(row.hosp_patients_per_million),
    }));

    const milestones = [10, 25, 50, 70, 80].map((threshold) => {
      const reached = data.find((d) => toNumber(d.people_fully_vaccinated_per_hundred) >= threshold);
      return {
        threshold,
        label: `${threshold}% Fully Vaccinated`,
        dateReached: reached?.date || null,
      };
    });

    const latest = data[data.length - 1];
    const vaccinationStats = {
      fully_vaccinated_per_hundred: toNumber(latest?.people_fully_vaccinated_per_hundred),
      total_vaccinations: toNumber(latest?.total_vaccinations),
      daily_vaccinations: toNumber(latest?.new_vaccinations),
    };

    return Response.json({
      country,
      effectiveness,
      timeline,
      milestones,
      vaccinationStats,
      totalDataPoints: data.length,
    });
  } catch (error) {
    console.error("Error in vaccination effectiveness analysis:", error);
    return Response.json({ error: "Failed to analyze vaccination effectiveness" }, { status: 500 });
  }
}
