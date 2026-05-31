import { integer, pgSchema, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

const labs = pgSchema("labs");

export const covidData = labs.table("covid_data", {
  id: serial("id").primaryKey(),
  isoCode: text("iso_code"),
  continent: text("continent"),
  location: text("location"),
  date: text("date"),
  totalCases: integer("total_cases"),
  newCases: integer("new_cases"),
  newCasesSmoothed: integer("new_cases_smoothed"),
  totalDeaths: integer("total_deaths"),
  newDeaths: integer("new_deaths"),
  newDeathsSmoothed: integer("new_deaths_smoothed"),
  totalCasesPerMillion: integer("total_cases_per_million"),
  newCasesPerMillion: integer("new_cases_per_million"),
  newCasesSmoothedPerMillion: integer("new_cases_smoothed_per_million"),
  totalDeathsPerMillion: integer("total_deaths_per_million"),
  newDeathsPerMillion: integer("new_deaths_per_million"),
  newDeathsSmoothedPerMillion: integer("new_deaths_smoothed_per_million"),
  reproductionRate: text("reproduction_rate"),
  icuPatients: integer("icu_patients"),
  icuPatientsPerMillion: integer("icu_patients_per_million"),
  hospPatients: integer("hosp_patients"),
  hospPatientsPerMillion: integer("hosp_patients_per_million"),
  weeklyIcuAdmissions: integer("weekly_icu_admissions"),
  weeklyIcuAdmissionsPerMillion: integer("weekly_icu_admissions_per_million"),
  weeklyHospAdmissions: integer("weekly_hosp_admissions"),
  weeklyHospAdmissionsPerMillion: integer("weekly_hosp_admissions_per_million"),
  totalTests: integer("total_tests"),
  newTests: integer("new_tests"),
  totalTestsPerThousand: text("total_tests_per_thousand"),
  newTestsPerThousand: text("new_tests_per_thousand"),
  newTestsSmoothed: integer("new_tests_smoothed"),
  newTestsSmoothedPerThousand: text("new_tests_smoothed_per_thousand"),
  positiveRate: text("positive_rate"),
  testsPerCase: text("tests_per_case"),
  testsUnits: text("tests_units"),
  totalVaccinations: integer("total_vaccinations"),
  peopleVaccinated: integer("people_vaccinated"),
  peopleFullyVaccinated: integer("people_fully_vaccinated"),
  totalBoosters: integer("total_boosters"),
  newVaccinations: integer("new_vaccinations"),
  newVaccinationsSmoothed: integer("new_vaccinations_smoothed"),
  totalVaccinationsPerHundred: text("total_vaccinations_per_hundred"),
  peopleVaccinatedPerHundred: text("people_vaccinated_per_hundred"),
  peopleFullyVaccinatedPerHundred: text("people_fully_vaccinated_per_hundred"),
  totalBoostersPerHundred: text("total_boosters_per_hundred"),
  newVaccinationsSmoothedPerMillion: integer("new_vaccinations_smoothed_per_million"),
  newPeopleVaccinatedSmoothed: integer("new_people_vaccinated_smoothed"),
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
  population: integer("population"),
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
