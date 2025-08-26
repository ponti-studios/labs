import { and, eq, gte } from "drizzle-orm";
import type { LoaderFunctionArgs } from "react-router";
import { covidData, db } from "~/db";

interface VaccinationTimeline {
	date: string;
	fullyVaccinatedPerHundred: number;
	newCasesSmoothed: number;
	newDeathsSmoothed: number;
	hospitalPatientsPerMillion: number;
}

export async function loader({ request }: LoaderFunctionArgs) {
	try {
		const url = new URL(request.url);
		const searchParams = url.searchParams;
		const country = searchParams.get("country") || "OWID_WRL";

		// Get vaccination timeline data for the last 12 months
		// Since date is stored as text, we'll calculate the cutoff date as a string
		const twelveMonthsAgo = new Date();
		twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
		const cutoffDate = twelveMonthsAgo.toISOString().split("T")[0]; // YYYY-MM-DD format

		const timelineData = await db
			.select({
				date: covidData.date,
				fullyVaccinatedPerHundred: covidData.peopleFullyVaccinatedPerHundred,
				newCasesSmoothed: covidData.newCasesSmoothed,
				newDeathsSmoothed: covidData.newDeathsSmoothed,
				hospitalPatientsPerMillion: covidData.hospPatientsPerMillion,
				totalVaccinations: covidData.totalVaccinations,
				newVaccinations: covidData.newVaccinations,
			})
			.from(covidData)
			.where(
				and(eq(covidData.isoCode, country), gte(covidData.date, cutoffDate)),
			)
			.orderBy(covidData.date);

		if (timelineData.length === 0) {
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

		// Calculate vaccination effectiveness metrics
		const calculateEffectiveness = (data: typeof timelineData) => {
			// Split data into pre and post-vaccination periods
			const preVaccination = data.filter(
				(d) => (d.fullyVaccinatedPerHundred || 0) < 10,
			);
			const postVaccination = data.filter(
				(d) => (d.fullyVaccinatedPerHundred || 0) >= 50,
			);

			if (preVaccination.length === 0 || postVaccination.length === 0) {
				return {
					overall: 0,
					againstHospitalization: 0,
					againstDeath: 0,
					breakthroughRate: 0,
				};
			}

			// Calculate average rates for each period
			const preVaxCaseRate =
				preVaccination.reduce((sum, d) => sum + (d.newCasesSmoothed || 0), 0) /
				preVaccination.length;
			const postVaxCaseRate =
				postVaccination.reduce((sum, d) => sum + (d.newCasesSmoothed || 0), 0) /
				postVaccination.length;

			const preVaxDeathRate =
				preVaccination.reduce((sum, d) => sum + (d.newDeathsSmoothed || 0), 0) /
				preVaccination.length;
			const postVaxDeathRate =
				postVaccination.reduce(
					(sum, d) => sum + (d.newDeathsSmoothed || 0),
					0,
				) / postVaccination.length;

			const preVaxHospitalizationRate =
				preVaccination.reduce(
					(sum, d) => sum + (d.hospitalPatientsPerMillion || 0),
					0,
				) / preVaccination.length;
			const postVaxHospitalizationRate =
				postVaccination.reduce(
					(sum, d) => sum + (d.hospitalPatientsPerMillion || 0),
					0,
				) / postVaccination.length;

			// Calculate effectiveness percentages
			const overallEffectiveness =
				preVaxCaseRate > 0
					? Math.max(
							0,
							Math.min(
								100,
								((preVaxCaseRate - postVaxCaseRate) / preVaxCaseRate) * 100,
							),
						)
					: 0;

			const hospitalizationEffectiveness =
				preVaxHospitalizationRate > 0
					? Math.max(
							0,
							Math.min(
								100,
								((preVaxHospitalizationRate - postVaxHospitalizationRate) /
									preVaxHospitalizationRate) *
									100,
							),
						)
					: 0;

			const deathEffectiveness =
				preVaxDeathRate > 0
					? Math.max(
							0,
							Math.min(
								100,
								((preVaxDeathRate - postVaxDeathRate) / preVaxDeathRate) * 100,
							),
						)
					: 0;

			// Estimate breakthrough rate (simplified calculation)
			const breakthroughRate =
				postVaxCaseRate > 0 ? Math.min(50, postVaxCaseRate / 10) : 0;

			return {
				overall: Math.round(overallEffectiveness * 100) / 100,
				againstHospitalization:
					Math.round(hospitalizationEffectiveness * 100) / 100,
				againstDeath: Math.round(deathEffectiveness * 100) / 100,
				breakthroughRate: Math.round(breakthroughRate * 100) / 100,
			};
		};

		const effectiveness = calculateEffectiveness(timelineData);

		// Format timeline data
		const timeline: VaccinationTimeline[] = timelineData.map((row) => ({
			date: row.date || "",
			fullyVaccinatedPerHundred: row.fullyVaccinatedPerHundred || 0,
			newCasesSmoothed: row.newCasesSmoothed || 0,
			newDeathsSmoothed: row.newDeathsSmoothed || 0,
			hospitalPatientsPerMillion: row.hospitalPatientsPerMillion || 0,
		}));

		// Calculate vaccination milestones
		const milestones = [
			{ threshold: 10, label: "10% Fully Vaccinated" },
			{ threshold: 25, label: "25% Fully Vaccinated" },
			{ threshold: 50, label: "50% Fully Vaccinated" },
			{ threshold: 70, label: "70% Fully Vaccinated" },
			{ threshold: 80, label: "80% Fully Vaccinated" },
		].map((milestone) => {
			const reachedDate = timelineData.find(
				(d) => (d.fullyVaccinatedPerHundred || 0) >= milestone.threshold,
			);
			return {
				...milestone,
				dateReached: reachedDate?.date || null,
			};
		});

		// Get latest vaccination stats
		const latest = timelineData[timelineData.length - 1];
		const vaccinationStats = {
			fullyVaccinatedPerHundred: latest?.fullyVaccinatedPerHundred || 0,
			totalVaccinations: latest?.totalVaccinations || 0,
			dailyVaccinations: latest?.newVaccinations || 0,
		};

		return Response.json({
			country,
			effectiveness,
			timeline,
			milestones,
			vaccinationStats,
			totalDataPoints: timelineData.length,
		});
	} catch (error) {
		console.error("Error in vaccination effectiveness analysis:", error);
		return Response.json(
			{ error: "Failed to analyze vaccination effectiveness" },
			{ status: 500 },
		);
	}
}
