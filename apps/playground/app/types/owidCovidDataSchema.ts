import { z } from "zod";

// Preprocess for optional nullable numbers: '' -> null, '123' -> 123
// Passes original value if it cannot be converted to a number, for Zod to handle the error.
const preprocessNumber = (val: unknown) => {
	if (val === "") return null;
	if (val === null || val === undefined) return val; // Keep null/undefined as is
	const num = Number(val);
	return Number.isNaN(num) ? val : num; // If NaN, pass original value for Zod to report error
};

export const OwidCovidDataSchema = z.object({
	iso_code: z.string().optional().nullable(),
	continent: z.string().optional().nullable(),
	location: z.string().optional().nullable(),
	date: z.string().optional().nullable(), // Consider z.coerce.date() for Date objects
	total_cases: z.preprocess(preprocessNumber, z.number().nullable().optional()),
	new_cases: z.preprocess(preprocessNumber, z.number().nullable().optional()),
	new_cases_smoothed: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	total_deaths: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	new_deaths: z.preprocess(preprocessNumber, z.number().nullable().optional()),
	new_deaths_smoothed: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	total_cases_per_million: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	new_cases_per_million: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	new_cases_smoothed_per_million: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	total_deaths_per_million: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	new_deaths_per_million: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	new_deaths_smoothed_per_million: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	reproduction_rate: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	icu_patients: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	icu_patients_per_million: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	hosp_patients: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	hosp_patients_per_million: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	weekly_icu_admissions: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	weekly_icu_admissions_per_million: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	weekly_hosp_admissions: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	weekly_hosp_admissions_per_million: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	total_tests: z.preprocess(preprocessNumber, z.number().nullable().optional()),
	new_tests: z.preprocess(preprocessNumber, z.number().nullable().optional()),
	total_tests_per_thousand: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	new_tests_per_thousand: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	new_tests_smoothed: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	new_tests_smoothed_per_thousand: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	positive_rate: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	tests_per_case: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	tests_units: z.string().optional().nullable(),
	total_vaccinations: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	people_vaccinated: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	people_fully_vaccinated: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	total_boosters: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	new_vaccinations: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	new_vaccinations_smoothed: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	total_vaccinations_per_hundred: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	people_vaccinated_per_hundred: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	people_fully_vaccinated_per_hundred: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	total_boosters_per_hundred: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	new_vaccinations_smoothed_per_million: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	new_people_vaccinated_smoothed: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	new_people_vaccinated_smoothed_per_hundred: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	stringency_index: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	population_density: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	median_age: z.preprocess(preprocessNumber, z.number().nullable().optional()),
	aged_65_older: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	aged_70_older: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	gdp_per_capita: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	extreme_poverty: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	cardiovasc_death_rate: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	diabetes_prevalence: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	female_smokers: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	male_smokers: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	handwashing_facilities: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	hospital_beds_per_thousand: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	life_expectancy: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	human_development_index: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	population: z.preprocess(preprocessNumber, z.number().nullable().optional()),
	excess_mortality_cumulative_absolute: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	excess_mortality_cumulative: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	excess_mortality: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
	excess_mortality_cumulative_per_million: z.preprocess(
		preprocessNumber,
		z.number().nullable().optional(),
	),
});

export type OwidCovidData = z.infer<typeof OwidCovidDataSchema>;
