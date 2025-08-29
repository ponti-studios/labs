import {
	boolean,
	integer,
	pgTable,
	real,
	serial,
	text,
	timestamp,
	unique,
} from "drizzle-orm/pg-core";

export const covidData = pgTable("covid_data", {
	id: serial().primaryKey().notNull(),
	isoCode: text("iso_code"),
	continent: text(),
	location: text(),
	date: text(),
	totalCases: real("total_cases"),
	newCases: real("new_cases"),
	newCasesSmoothed: real("new_cases_smoothed"),
	totalDeaths: real("total_deaths"),
	newDeaths: real("new_deaths"),
	newDeathsSmoothed: real("new_deaths_smoothed"),
	totalCasesPerMillion: real("total_cases_per_million"),
	newCasesPerMillion: real("new_cases_per_million"),
	newCasesSmoothedPerMillion: real("new_cases_smoothed_per_million"),
	totalDeathsPerMillion: real("total_deaths_per_million"),
	newDeathsPerMillion: real("new_deaths_per_million"),
	newDeathsSmoothedPerMillion: real("new_deaths_smoothed_per_million"),
	reproductionRate: real("reproduction_rate"),
	icuPatients: real("icu_patients"),
	icuPatientsPerMillion: real("icu_patients_per_million"),
	hospPatients: real("hosp_patients"),
	hospPatientsPerMillion: real("hosp_patients_per_million"),
	weeklyIcuAdmissions: real("weekly_icu_admissions"),
	weeklyIcuAdmissionsPerMillion: real("weekly_icu_admissions_per_million"),
	weeklyHospAdmissions: real("weekly_hosp_admissions"),
	weeklyHospAdmissionsPerMillion: real("weekly_hosp_admissions_per_million"),
	totalTests: real("total_tests"),
	newTests: real("new_tests"),
	totalTestsPerThousand: real("total_tests_per_thousand"),
	newTestsPerThousand: real("new_tests_per_thousand"),
	newTestsSmoothed: real("new_tests_smoothed"),
	newTestsSmoothedPerThousand: real("new_tests_smoothed_per_thousand"),
	positiveRate: real("positive_rate"),
	testsPerCase: real("tests_per_case"),
	testsUnits: text("tests_units"),
	totalVaccinations: real("total_vaccinations"),
	peopleVaccinated: real("people_vaccinated"),
	peopleFullyVaccinated: real("people_fully_vaccinated"),
	totalBoosters: real("total_boosters"),
	newVaccinations: real("new_vaccinations"),
	newVaccinationsSmoothed: real("new_vaccinations_smoothed"),
	totalVaccinationsPerHundred: real("total_vaccinations_per_hundred"),
	peopleVaccinatedPerHundred: real("people_vaccinated_per_hundred"),
	peopleFullyVaccinatedPerHundred: real("people_fully_vaccinated_per_hundred"),
	totalBoostersPerHundred: real("total_boosters_per_hundred"),
	newVaccinationsSmoothedPerMillion: real(
		"new_vaccinations_smoothed_per_million",
	),
	newPeopleVaccinatedSmoothed: real("new_people_vaccinated_smoothed"),
	newPeopleVaccinatedSmoothedPerHundred: real(
		"new_people_vaccinated_smoothed_per_hundred",
	),
	stringencyIndex: real("stringency_index"),
	populationDensity: real("population_density"),
	medianAge: real("median_age"),
	aged65Older: real("aged_65_older"),
	aged70Older: real("aged_70_older"),
	gdpPerCapita: real("gdp_per_capita"),
	extremePoverty: real("extreme_poverty"),
	cardiovascDeathRate: real("cardiovasc_death_rate"),
	diabetesPrevalence: real("diabetes_prevalence"),
	femaleSmokers: real("female_smokers"),
	maleSmokers: real("male_smokers"),
	handwashingFacilities: real("handwashing_facilities"),
	hospitalBedsPerThousand: real("hospital_beds_per_thousand"),
	lifeExpectancy: real("life_expectancy"),
	humanDevelopmentIndex: real("human_development_index"),
	population: real(),
	excessMortalityCumulativeAbsolute: real(
		"excess_mortality_cumulative_absolute",
	),
	excessMortalityCumulative: real("excess_mortality_cumulative"),
	excessMortality: real("excess_mortality"),
	excessMortalityCumulativePerMillion: real(
		"excess_mortality_cumulative_per_million",
	),
});
export type CovidData = typeof covidData.$inferSelect;
export type CovidDataInsert = typeof covidData.$inferInsert;

export const tflCameras = pgTable(
	"tfl_cameras",
	{
		id: serial().primaryKey().notNull(),
		tflId: text("tfl_id").notNull(),
		commonName: text("common_name").notNull(),
		available: boolean().default(true),
		imageUrl: text("image_url"),
		videoUrl: text("video_url"),
		view: text(),
		lat: real().notNull(),
		lng: real().notNull(),
		createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
		updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
	},
	(table) => [unique("tfl_cameras_tfl_id_unique").on(table.tflId)],
);
export type TflCamera = typeof tflCameras.$inferSelect;

export const todos = pgTable("todos", {
	id: serial().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	projectId: integer("project_id").references(() => projects.id),
	title: text().notNull(),
	start: text().notNull(),
	end: text().notNull(),
	completed: boolean().default(false).notNull(),
	createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
});
export type Todo = typeof todos.$inferSelect;
export type TodoInsert = typeof todos.$inferInsert;

export const projects = pgTable("projects", {
	id: serial().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	name: text().notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
});
export type Project = typeof projects.$inferSelect;
export type ProjectInsert = typeof projects.$inferInsert;

export const embeddings = pgTable("embeddings", {
	id: serial().primaryKey().notNull(),
	todoId: integer("todo_id")
		.references(() => todos.id, { onDelete: "cascade" })
		.notNull(),
	content: text().notNull(),
	embedding: real("embedding").array().notNull(),
	model: text().notNull().default("gemini-embedding-001"),
	createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
});
export type Embedding = typeof embeddings.$inferSelect;
export type EmbeddingInsert = typeof embeddings.$inferInsert;
