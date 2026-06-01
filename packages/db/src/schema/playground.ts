import { bigint, date, integer, pgSchema, real, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

const labs = pgSchema("labs");

export const covidData = labs.table("covid_data", {
  id: serial("id").primaryKey(),
  isoCode: text("iso_code"),
  continent: text("continent"),
  location: text("location"),
  date: date("date"),
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
  reproductionRate: text("reproduction_rate"),
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
  totalTestsPerThousand: text("total_tests_per_thousand"),
  newTestsPerThousand: text("new_tests_per_thousand"),
  newTestsSmoothed: real("new_tests_smoothed"),
  newTestsSmoothedPerThousand: text("new_tests_smoothed_per_thousand"),
  positiveRate: text("positive_rate"),
  testsPerCase: text("tests_per_case"),
  testsUnits: text("tests_units"),
  totalVaccinations: bigint("total_vaccinations", { mode: "number" }),
  peopleVaccinated: bigint("people_vaccinated", { mode: "number" }),
  peopleFullyVaccinated: bigint("people_fully_vaccinated", { mode: "number" }),
  totalBoosters: bigint("total_boosters", { mode: "number" }),
  newVaccinations: real("new_vaccinations"),
  newVaccinationsSmoothed: real("new_vaccinations_smoothed"),
  totalVaccinationsPerHundred: text("total_vaccinations_per_hundred"),
  peopleVaccinatedPerHundred: text("people_vaccinated_per_hundred"),
  peopleFullyVaccinatedPerHundred: text("people_fully_vaccinated_per_hundred"),
  totalBoostersPerHundred: text("total_boosters_per_hundred"),
  newVaccinationsSmoothedPerMillion: real("new_vaccinations_smoothed_per_million"),
  newPeopleVaccinatedSmoothed: real("new_people_vaccinated_smoothed"),
  newPeopleVaccinatedSmoothedPerHundred: text("new_people_vaccinated_smoothed_per_hundred"),
  stringencyIndex: text("stringency_index"),
  populationDensity: text("population_density"),
  medianAge: text("median_age"),
  aged65Older: text("aged_65_older"),
  aged70Older: text("aged_70_older"),
  gdpPerCapita: text("gdp_per_capita"),
  extremePoverty: text("extreme_poverty"),
  cardiovascDeathRate: text("cardiovasc_death_rate"),
  diabetesPrevalence: text("diabetes_prevalence"),
  femaleSmokers: text("female_smokers"),
  maleSmokers: text("male_smokers"),
  handwashingFacilities: text("handwashing_facilities"),
  hospitalBedsPerThousand: text("hospital_beds_per_thousand"),
  lifeExpectancy: text("life_expectancy"),
  humanDevelopmentIndex: text("human_development_index"),
  population: bigint("population", { mode: "number" }),
  excessMortalityCumulativeAbsolute: text("excess_mortality_cumulative_absolute"),
  excessMortalityCumulative: text("excess_mortality_cumulative"),
  excessMortality: text("excess_mortality"),
  excessMortalityCumulativePerMillion: text("excess_mortality_cumulative_per_million"),
});

export const tflCameras = labs.table("tfl_cameras", {
  id: serial("id").primaryKey(),
  tflId: text("tfl_id").notNull(),
  commonName: text("common_name").notNull(),
  available: integer("available"),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  view: text("view"),
  lat: text("lat").notNull(),
  lng: text("lng").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const todos = labs.table("todos", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  start: text("start").notNull(),
  end: text("end").notNull(),
  completed: integer("completed"),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const tags = labs.table(
  "tags",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    normalizedName: text("normalized_name").notNull(),
    color: text("color"),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
  },
  (table) => ({
    userNormalizedNameIdx: uniqueIndex("tags_user_normalized_name_idx").on(
      table.userId,
      table.normalizedName,
    ),
  }),
);

export const todoTags = labs.table(
  "todo_tags",
  {
    id: serial("id").primaryKey(),
    todoId: integer("todo_id")
      .notNull()
      .references(() => todos.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at"),
  },
  (table) => ({
    todoTagIdx: uniqueIndex("todo_tags_todo_id_tag_id_idx").on(table.todoId, table.tagId),
  }),
);

export const embeddings = labs.table("embeddings", {
  id: serial("id").primaryKey(),
  todoId: integer("todo_id").notNull(),
  content: text("content").notNull(),
  embedding: text("embedding").notNull(),
  model: text("model").notNull(),
  createdAt: timestamp("created_at"),
});

export const rhobhDailyPuzzles = labs.table(
  "rhobh_daily_puzzles",
  {
    id: serial("id").primaryKey(),
    dateUtc: text("date_utc").notNull(),
    franchise: text("franchise").notNull(),
    answer: text("answer").notNull(),
    answerType: text("answer_type").notNull(),
    normalizedAnswer: text("normalized_answer").notNull(),
    clue: text("clue").notNull(),
    detail: text("detail").notNull(),
    role: text("role").notNull(),
    newsMode: text("news_mode").notNull(),
    sourceUrls: text("source_urls").notNull(),
    sourceTitles: text("source_titles").notNull(),
    sourcePublishedAt: text("source_published_at").notNull(),
    sourceSummary: text("source_summary").notNull(),
    generationStatus: text("generation_status").notNull(),
    validationStatus: text("validation_status").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    franchiseDateIdx: uniqueIndex("rhobh_daily_puzzles_franchise_date_idx").on(
      table.franchise,
      table.dateUtc,
    ),
  }),
);

export type CovidData = typeof covidData.$inferSelect;
export type NewCovidData = typeof covidData.$inferInsert;
export type TflCamera = typeof tflCameras.$inferSelect;
export type NewTflCamera = typeof tflCameras.$inferInsert;
export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type TodoTag = typeof todoTags.$inferSelect;
export type NewTodoTag = typeof todoTags.$inferInsert;
export type Embedding = typeof embeddings.$inferSelect;
export type NewEmbedding = typeof embeddings.$inferInsert;
export type RhobhDailyPuzzle = typeof rhobhDailyPuzzles.$inferSelect;
export type NewRhobhDailyPuzzle = typeof rhobhDailyPuzzles.$inferInsert;
