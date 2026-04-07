import fs, { createReadStream } from 'node:fs';
import path from 'node:path';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { parse } from 'csv-parse';
import { sql } from 'drizzle-orm';
import { db } from './index';
import { type CovidDataInsert, covidData } from './schema';

// Helper function to safely parse numbers
function safeParseNumber(value: string | null | undefined): number | null {
  if (!value || value === '' || value === 'null' || value === 'undefined') {
    return null;
  }
  const num = Number.parseFloat(value);
  return Number.isNaN(num) ? null : num;
}

// Helper function to safely parse dates
function safeParseDate(value: string | null | undefined): string | null {
  if (!value || value === '' || value === 'null' || value === 'undefined') {
    return null;
  }
  // Validate date format YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(value) ? value : null;
}

interface CsvChunk {
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

async function populateDatabase() {
  console.log('Starting database population from CSV...');

  try {
    const csvPath = path.join(process.cwd(), '_data', 'owid-covid-data.csv');

    // Check if CSV file exists
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found at ${csvPath}`);
    }

    console.log('Clearing existing data...');
    await db.delete(covidData);
    console.log('Cleared existing data');

    let processedRows = 0;
    let insertedRows = 0;
    let errorCount = 0;

    // Batch size for SQLite
    const batchSize = 10;
    let batch: CovidDataInsert[] = [];

    // Create a transform stream to process CSV rows
    const transformStream = new Transform({
      objectMode: true,
      async transform(chunk: CsvChunk, encoding, callback) {
        processedRows++;

        try {
          // Map CSV columns to database schema
          const record = {
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
            reproductionRate: safeParseNumber(chunk.reproduction_rate),
            icuPatients: safeParseNumber(chunk.icu_patients),
            icuPatientsPerMillion: safeParseNumber(chunk.icu_patients_per_million),
            hospPatients: safeParseNumber(chunk.hosp_patients),
            hospPatientsPerMillion: safeParseNumber(chunk.hosp_patients_per_million),
            weeklyIcuAdmissions: safeParseNumber(chunk.weekly_icu_admissions),
            weeklyIcuAdmissionsPerMillion: safeParseNumber(chunk.weekly_icu_admissions_per_million),
            weeklyHospAdmissions: safeParseNumber(chunk.weekly_hosp_admissions),
            weeklyHospAdmissionsPerMillion: safeParseNumber(
              chunk.weekly_hosp_admissions_per_million
            ),
            totalTests: safeParseNumber(chunk.total_tests),
            newTests: safeParseNumber(chunk.new_tests),
            totalTestsPerThousand: safeParseNumber(chunk.total_tests_per_thousand),
            newTestsPerThousand: safeParseNumber(chunk.new_tests_per_thousand),
            newTestsSmoothed: safeParseNumber(chunk.new_tests_smoothed),
            newTestsSmoothedPerThousand: safeParseNumber(chunk.new_tests_smoothed_per_thousand),
            positiveRate: safeParseNumber(chunk.positive_rate),
            testsPerCase: safeParseNumber(chunk.tests_per_case),
            testsUnits: chunk.tests_units || null,
            totalVaccinations: safeParseNumber(chunk.total_vaccinations),
            peopleVaccinated: safeParseNumber(chunk.people_vaccinated),
            peopleFullyVaccinated: safeParseNumber(chunk.people_fully_vaccinated),
            totalBoosters: safeParseNumber(chunk.total_boosters),
            newVaccinations: safeParseNumber(chunk.new_vaccinations),
            newVaccinationsSmoothed: safeParseNumber(chunk.new_vaccinations_smoothed),
            totalVaccinationsPerHundred: safeParseNumber(chunk.total_vaccinations_per_hundred),
            peopleVaccinatedPerHundred: safeParseNumber(chunk.people_vaccinated_per_hundred),
            peopleFullyVaccinatedPerHundred: safeParseNumber(
              chunk.people_fully_vaccinated_per_hundred
            ),
            totalBoostersPerHundred: safeParseNumber(chunk.total_boosters_per_hundred),
            newVaccinationsSmoothedPerMillion: safeParseNumber(
              chunk.new_vaccinations_smoothed_per_million
            ),
            newPeopleVaccinatedSmoothed: safeParseNumber(chunk.new_people_vaccinated_smoothed),
            newPeopleVaccinatedSmoothedPerHundred: safeParseNumber(
              chunk.new_people_vaccinated_smoothed_per_hundred
            ),
            stringencyIndex: safeParseNumber(chunk.stringency_index),
            populationDensity: safeParseNumber(chunk.population_density),
            medianAge: safeParseNumber(chunk.median_age),
            aged65Older: safeParseNumber(chunk.aged_65_older),
            aged70Older: safeParseNumber(chunk.aged_70_older),
            gdpPerCapita: safeParseNumber(chunk.gdp_per_capita),
            extremePoverty: safeParseNumber(chunk.extreme_poverty),
            cardiovascDeathRate: safeParseNumber(chunk.cardiovasc_death_rate),
            diabetesPrevalence: safeParseNumber(chunk.diabetes_prevalence),
            femaleSmokers: safeParseNumber(chunk.female_smokers),
            maleSmokers: safeParseNumber(chunk.male_smokers),
            handwashingFacilities: safeParseNumber(chunk.handwashing_facilities),
            hospitalBedsPerThousand: safeParseNumber(chunk.hospital_beds_per_thousand),
            lifeExpectancy: safeParseNumber(chunk.life_expectancy),
            humanDevelopmentIndex: safeParseNumber(chunk.human_development_index),
            population: safeParseNumber(chunk.population),
            excessMortalityCumulativeAbsolute: safeParseNumber(
              chunk.excess_mortality_cumulative_absolute
            ),
            excessMortalityCumulative: safeParseNumber(chunk.excess_mortality_cumulative),
            excessMortality: safeParseNumber(chunk.excess_mortality),
            excessMortalityCumulativePerMillion: safeParseNumber(
              chunk.excess_mortality_cumulative_per_million
            ),
          };

          batch.push(record);

          // Insert batch when it reaches the batch size
          if (batch.length >= batchSize) {
            try {
              await db.insert(covidData).values(batch);
              insertedRows += batch.length;
              console.log(
                `Inserted batch of ${batch.length} records. Total processed: ${processedRows}, Total inserted: ${insertedRows}`
              );
            } catch (insertError) {
              console.error('Error inserting batch:', insertError);
              // Try inserting records one by one if batch fails
              for (const record of batch) {
                try {
                  await db.insert(covidData).values([record]);
                  insertedRows++;
                } catch (singleError) {
                  errorCount++;
                  if (errorCount <= 10) {
                    console.warn('Failed to insert single record:', singleError);
                  }
                }
              }
            }
            batch = []; // Clear the batch
          }
        } catch (error) {
          errorCount++;
          if (errorCount <= 10) {
            console.warn('Invalid data item:', error);
          }
        }

        callback();
      },
    });

    // Create the CSV parsing stream
    const parseStream = parse({
      columns: true,
      skip_empty_lines: true,
      delimiter: ',',
      quote: '"',
      escape: '"',
    });

    // Start the pipeline
    await pipeline(createReadStream(csvPath), parseStream, transformStream);

    // Insert any remaining records in the final batch
    if (batch.length > 0) {
      try {
        await db.insert(covidData).values(batch);
        insertedRows += batch.length;
        console.log(`Inserted final batch of ${batch.length} records`);
      } catch (insertError) {
        console.error('Error inserting final batch:', insertError);
        // Try inserting records one by one if batch fails
        for (const record of batch) {
          try {
            await db.insert(covidData).values([record]);
            insertedRows++;
          } catch (singleError) {
            errorCount++;
            if (errorCount <= 10) {
              console.warn('Failed to insert single record:', singleError);
            }
          }
        }
      }
    }

    console.log('Database population complete!');
    console.log(`Total processed rows: ${processedRows}`);
    console.log(`Total inserted rows: ${insertedRows}`);
    console.log(`Error count: ${errorCount}`);

    // Get some stats
    const totalRecordsResult = await db
      .select()
      .from(covidData)
      .then((rows) => rows.length);

    const countries = await db
      .select()
      .from(covidData)
      .where(sql`iso_code IS NOT NULL AND iso_code != 'OWID_WRL'`)
      .groupBy(covidData.isoCode, covidData.location);

    console.log(`Total records in database: ${totalRecordsResult}`);
    console.log(`Number of countries: ${countries.length}`);
  } catch (error) {
    console.error('Error populating database:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  populateDatabase()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to populate database:', error);
      process.exit(1);
    });
}

export { populateDatabase };
