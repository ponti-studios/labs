import fs, { createReadStream } from "node:fs";
import path from "node:path";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

import { parse } from "csv-parse";

import { db, sql } from "../drizzle";
import { covidData, type NewCovidData } from "../schema/playground";

export type PopulateCovidOptions = {
  csvPath?: string;
};

export interface CovidCsvChunk {
  iso_code?: string;
  continent?: string;
  location?: string;
  date?: string;
  total_cases?: string;
  new_cases?: string;
  new_cases_smoothed?: string;
  total_deaths?: string;
  new_deaths?: string;
  new_deaths_smoothed?: string;
  total_cases_per_million?: string;
  new_cases_per_million?: string;
  new_cases_smoothed_per_million?: string;
  total_deaths_per_million?: string;
  new_deaths_per_million?: string;
  new_deaths_smoothed_per_million?: string;
  reproduction_rate?: string;
  icu_patients?: string;
  icu_patients_per_million?: string;
  hosp_patients?: string;
  hosp_patients_per_million?: string;
  weekly_icu_admissions?: string;
  weekly_icu_admissions_per_million?: string;
  weekly_hosp_admissions?: string;
  weekly_hosp_admissions_per_million?: string;
  total_tests?: string;
  new_tests?: string;
  total_tests_per_thousand?: string;
  new_tests_per_thousand?: string;
  new_tests_smoothed?: string;
  new_tests_smoothed_per_thousand?: string;
  positive_rate?: string;
  tests_per_case?: string;
  tests_units?: string;
  total_vaccinations?: string;
  people_vaccinated?: string;
  people_fully_vaccinated?: string;
  total_boosters?: string;
  new_vaccinations?: string;
  new_vaccinations_smoothed?: string;
  total_vaccinations_per_hundred?: string;
  people_vaccinated_per_hundred?: string;
  people_fully_vaccinated_per_hundred?: string;
  total_boosters_per_hundred?: string;
  new_vaccinations_smoothed_per_million?: string;
  new_people_vaccinated_smoothed?: string;
  new_people_vaccinated_smoothed_per_hundred?: string;
  stringency_index?: string;
  population_density?: string;
  median_age?: string;
  aged_65_older?: string;
  aged_70_older?: string;
  gdp_per_capita?: string;
  extreme_poverty?: string;
  cardiovasc_death_rate?: string;
  diabetes_prevalence?: string;
  female_smokers?: string;
  male_smokers?: string;
  handwashing_facilities?: string;
  hospital_beds_per_thousand?: string;
  life_expectancy?: string;
  human_development_index?: string;
  population?: string;
  excess_mortality_cumulative_absolute?: string;
  excess_mortality_cumulative?: string;
  excess_mortality?: string;
  excess_mortality_cumulative_per_million?: string;
}

function safeParseNumber(value: string | null | undefined): number | null {
  if (!value || value === "" || value === "null" || value === "undefined") {
    return null;
  }

  const num = Number.parseFloat(value);
  return Number.isNaN(num) ? null : num;
}

function safeParseDate(value: string | null | undefined): string | null {
  if (!value || value === "" || value === "null" || value === "undefined") {
    return null;
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(value) ? value : null;
}

function safeParseText(value: string | null | undefined): string | null {
  if (!value || value === "" || value === "null" || value === "undefined") {
    return null;
  }

  return value;
}

function getCsvPath(options: PopulateCovidOptions = {}) {
  return options.csvPath ?? path.join(process.cwd(), "_data", "owid-covid-data.csv");
}

export async function populateCovidData(options: PopulateCovidOptions = {}) {
  const csvPath = getCsvPath(options);

  console.log("Starting database population from CSV...");

  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found at ${csvPath}`);
  }

  console.log("Clearing existing data...");
  await db.delete(covidData);
  console.log("Cleared existing data");

  let processedRows = 0;
  let insertedRows = 0;
  let errorCount = 0;
  const batchSize = 10;
  let batch: NewCovidData[] = [];

  const transformStream = new Transform({
    objectMode: true,
    async transform(chunk: CovidCsvChunk, _encoding, callback) {
      processedRows++;

      try {
        const record: NewCovidData = {
          isoCode: chunk.iso_code || null,
          continent: chunk.continent || null,
          location: chunk.location || null,
          date: safeParseDate(chunk.date),
          totalCases: safeParseNumber(chunk.total_cases),
          newCases: safeParseNumber(chunk.new_cases),
          newCasesSmoothed: safeParseNumber(chunk.new_cases_smoothed),
          totalDeaths: safeParseNumber(chunk.total_deaths),
          newDeaths: safeParseNumber(chunk.new_deaths),
          newDeathsSmoothed: safeParseNumber(chunk.new_deaths_smoothed),
          totalCasesPerMillion: safeParseNumber(chunk.total_cases_per_million),
          newCasesPerMillion: safeParseNumber(chunk.new_cases_per_million),
          newCasesSmoothedPerMillion: safeParseNumber(chunk.new_cases_smoothed_per_million),
          totalDeathsPerMillion: safeParseNumber(chunk.total_deaths_per_million),
          newDeathsPerMillion: safeParseNumber(chunk.new_deaths_per_million),
          newDeathsSmoothedPerMillion: safeParseNumber(chunk.new_deaths_smoothed_per_million),
          reproductionRate: safeParseText(chunk.reproduction_rate),
          icuPatients: safeParseNumber(chunk.icu_patients),
          icuPatientsPerMillion: safeParseNumber(chunk.icu_patients_per_million),
          hospPatients: safeParseNumber(chunk.hosp_patients),
          hospPatientsPerMillion: safeParseNumber(chunk.hosp_patients_per_million),
          weeklyIcuAdmissions: safeParseNumber(chunk.weekly_icu_admissions),
          weeklyIcuAdmissionsPerMillion: safeParseNumber(chunk.weekly_icu_admissions_per_million),
          weeklyHospAdmissions: safeParseNumber(chunk.weekly_hosp_admissions),
          weeklyHospAdmissionsPerMillion: safeParseNumber(chunk.weekly_hosp_admissions_per_million),
          totalTests: safeParseNumber(chunk.total_tests),
          newTests: safeParseNumber(chunk.new_tests),
          totalTestsPerThousand: safeParseText(chunk.total_tests_per_thousand),
          newTestsPerThousand: safeParseText(chunk.new_tests_per_thousand),
          newTestsSmoothed: safeParseNumber(chunk.new_tests_smoothed),
          newTestsSmoothedPerThousand: safeParseText(chunk.new_tests_smoothed_per_thousand),
          positiveRate: safeParseText(chunk.positive_rate),
          testsPerCase: safeParseText(chunk.tests_per_case),
          testsUnits: chunk.tests_units || null,
          totalVaccinations: safeParseNumber(chunk.total_vaccinations),
          peopleVaccinated: safeParseNumber(chunk.people_vaccinated),
          peopleFullyVaccinated: safeParseNumber(chunk.people_fully_vaccinated),
          totalBoosters: safeParseNumber(chunk.total_boosters),
          newVaccinations: safeParseNumber(chunk.new_vaccinations),
          newVaccinationsSmoothed: safeParseNumber(chunk.new_vaccinations_smoothed),
          totalVaccinationsPerHundred: safeParseText(chunk.total_vaccinations_per_hundred),
          peopleVaccinatedPerHundred: safeParseText(chunk.people_vaccinated_per_hundred),
          peopleFullyVaccinatedPerHundred: safeParseText(chunk.people_fully_vaccinated_per_hundred),
          totalBoostersPerHundred: safeParseText(chunk.total_boosters_per_hundred),
          newVaccinationsSmoothedPerMillion: safeParseNumber(
            chunk.new_vaccinations_smoothed_per_million,
          ),
          newPeopleVaccinatedSmoothed: safeParseNumber(chunk.new_people_vaccinated_smoothed),
          newPeopleVaccinatedSmoothedPerHundred: safeParseText(
            chunk.new_people_vaccinated_smoothed_per_hundred,
          ),
          stringencyIndex: safeParseText(chunk.stringency_index),
          populationDensity: safeParseText(chunk.population_density),
          medianAge: safeParseText(chunk.median_age),
          aged65Older: safeParseText(chunk.aged_65_older),
          aged70Older: safeParseText(chunk.aged_70_older),
          gdpPerCapita: safeParseText(chunk.gdp_per_capita),
          extremePoverty: safeParseText(chunk.extreme_poverty),
          cardiovascDeathRate: safeParseText(chunk.cardiovasc_death_rate),
          diabetesPrevalence: safeParseText(chunk.diabetes_prevalence),
          femaleSmokers: safeParseText(chunk.female_smokers),
          maleSmokers: safeParseText(chunk.male_smokers),
          handwashingFacilities: safeParseText(chunk.handwashing_facilities),
          hospitalBedsPerThousand: safeParseText(chunk.hospital_beds_per_thousand),
          lifeExpectancy: safeParseText(chunk.life_expectancy),
          humanDevelopmentIndex: safeParseText(chunk.human_development_index),
          population: safeParseNumber(chunk.population),
          excessMortalityCumulativeAbsolute: safeParseText(
            chunk.excess_mortality_cumulative_absolute,
          ),
          excessMortalityCumulative: safeParseText(chunk.excess_mortality_cumulative),
          excessMortality: safeParseText(chunk.excess_mortality),
          excessMortalityCumulativePerMillion: safeParseText(
            chunk.excess_mortality_cumulative_per_million,
          ),
        };

        batch.push(record);

        if (batch.length >= batchSize) {
          try {
            await db.insert(covidData).values(batch);
            insertedRows += batch.length;
            console.log(
              `Inserted batch of ${batch.length} records. Total processed: ${processedRows}, Total inserted: ${insertedRows}`,
            );
          } catch (insertError) {
            console.error("Error inserting batch:", insertError);

            for (const singleRecord of batch) {
              try {
                await db.insert(covidData).values([singleRecord]);
                insertedRows++;
              } catch (singleError) {
                errorCount++;
                if (errorCount <= 10) {
                  console.warn("Failed to insert single record:", singleError);
                }
              }
            }
          }

          batch = [];
        }
      } catch (error) {
        errorCount++;
        if (errorCount <= 10) {
          console.warn("Invalid data item:", error);
        }
      }

      callback();
    },
  });

  const parseStream = parse({
    columns: true,
    skip_empty_lines: true,
    delimiter: ",",
    quote: '"',
    escape: '"',
  });

  await pipeline(createReadStream(csvPath), parseStream, transformStream);

  if (batch.length > 0) {
    try {
      await db.insert(covidData).values(batch);
      insertedRows += batch.length;
    } catch (insertError) {
      console.error("Error inserting final batch:", insertError);
    }
  }

  const totalCount = await db.select({ count: sql<number>`count(*)` }).from(covidData);

  console.log(`Population complete. Rows processed: ${processedRows}`);
  console.log(`Rows inserted: ${insertedRows}`);
  console.log(`Rows in database: ${totalCount[0]?.count ?? 0}`);
}
