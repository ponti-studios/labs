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
  fullyVaccinatedPerHundred: number;
  newCasesSmoothed: number;
  newDeathsSmoothed: number;
  hospitalPatientsPerMillion: number;
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

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    const cutoffDate = twelveMonthsAgo.toISOString().split("T")[0];

    const allRows = await fetchCovidData(country, cutoffDate);
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
      const preVax = data.filter((d) => toNumber(d.peopleFullyVaccinatedPerHundred) < 10);
      const postVax = data.filter((d) => toNumber(d.peopleFullyVaccinatedPerHundred) >= 50);

      if (preVax.length === 0 || postVax.length === 0) {
        return { overall: 0, againstHospitalization: 0, againstDeath: 0, breakthroughRate: 0 };
      }

      const preVaxCaseRate =
        preVax.reduce((s, d) => s + toNumber(d.newCasesSmoothed), 0) / preVax.length;
      const postVaxCaseRate =
        postVax.reduce((s, d) => s + toNumber(d.newCasesSmoothed), 0) / postVax.length;
      const preVaxDeathRate =
        preVax.reduce((s, d) => s + toNumber(d.newDeathsSmoothed), 0) / preVax.length;
      const postVaxDeathRate =
        postVax.reduce((s, d) => s + toNumber(d.newDeathsSmoothed), 0) / postVax.length;
      const preVaxHospRate =
        preVax.reduce((s, d) => s + toNumber(d.hospPatientsPerMillion), 0) / preVax.length;
      const postVaxHospRate =
        postVax.reduce((s, d) => s + toNumber(d.hospPatientsPerMillion), 0) / postVax.length;

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
      fullyVaccinatedPerHundred: toNumber(row.peopleFullyVaccinatedPerHundred),
      newCasesSmoothed: toNumber(row.newCasesSmoothed),
      newDeathsSmoothed: toNumber(row.newDeathsSmoothed),
      hospitalPatientsPerMillion: toNumber(row.hospPatientsPerMillion),
    }));

    const milestones = [10, 25, 50, 70, 80].map((threshold) => {
      const reached = data.find((d) => toNumber(d.peopleFullyVaccinatedPerHundred) >= threshold);
      return {
        threshold,
        label: `${threshold}% Fully Vaccinated`,
        dateReached: reached?.date || null,
      };
    });

    const latest = data[data.length - 1];
    const vaccinationStats = {
      fullyVaccinatedPerHundred: toNumber(latest?.peopleFullyVaccinatedPerHundred),
      totalVaccinations: toNumber(latest?.totalVaccinations),
      dailyVaccinations: toNumber(latest?.newVaccinations),
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
