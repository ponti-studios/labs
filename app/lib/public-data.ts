import { z } from "zod";

const BASE =
  process.env.PUBLIC_DATA_URL ?? "https://public-data-production.up.railway.app";

export const covidRowSchema = z.object({
  iso_code: z.string(),
  continent: z.string().nullable(),
  location: z.string().nullable(),
  date: z.string().nullable(),
  total_cases: z.number().nullable(),
  new_cases: z.number().nullable(),
  new_cases_smoothed: z.number().nullable(),
  total_cases_per_million: z.number().nullable(),
  new_cases_per_million: z.number().nullable(),
  new_cases_smoothed_per_million: z.number().nullable(),
  total_deaths: z.number().nullable(),
  new_deaths: z.number().nullable(),
  new_deaths_smoothed: z.number().nullable(),
  total_deaths_per_million: z.number().nullable(),
  new_deaths_per_million: z.number().nullable(),
  new_deaths_smoothed_per_million: z.number().nullable(),
  reproduction_rate: z.number().nullable(),
  icu_patients: z.number().nullable(),
  icu_patients_per_million: z.number().nullable(),
  hosp_patients: z.number().nullable(),
  hosp_patients_per_million: z.number().nullable(),
  weekly_icu_admissions: z.number().nullable(),
  weekly_icu_admissions_per_million: z.number().nullable(),
  weekly_hosp_admissions: z.number().nullable(),
  weekly_hosp_admissions_per_million: z.number().nullable(),
  total_tests: z.number().nullable(),
  new_tests: z.number().nullable(),
  total_tests_per_thousand: z.number().nullable(),
  new_tests_per_thousand: z.number().nullable(),
  new_tests_smoothed: z.number().nullable(),
  new_tests_smoothed_per_thousand: z.number().nullable(),
  positive_rate: z.number().nullable(),
  tests_per_case: z.number().nullable(),
  tests_units: z.string().nullable(),
  total_vaccinations: z.number().nullable(),
  people_vaccinated: z.number().nullable(),
  people_fully_vaccinated: z.number().nullable(),
  total_boosters: z.number().nullable(),
  new_vaccinations: z.number().nullable(),
  new_vaccinations_smoothed: z.number().nullable(),
  total_vaccinations_per_hundred: z.number().nullable(),
  people_vaccinated_per_hundred: z.number().nullable(),
  people_fully_vaccinated_per_hundred: z.number().nullable(),
  total_boosters_per_hundred: z.number().nullable(),
  new_vaccinations_smoothed_per_million: z.number().nullable(),
  new_people_vaccinated_smoothed: z.number().nullable(),
  new_people_vaccinated_smoothed_per_hundred: z.number().nullable(),
  stringency_index: z.number().nullable(),
  population_density: z.number().nullable(),
  median_age: z.number().nullable(),
  aged_65_older: z.number().nullable(),
  aged_70_older: z.number().nullable(),
  gdp_per_capita: z.number().nullable(),
  extreme_poverty: z.number().nullable(),
  cardiovasc_death_rate: z.number().nullable(),
  diabetes_prevalence: z.number().nullable(),
  female_smokers: z.number().nullable(),
  male_smokers: z.number().nullable(),
  handwashing_facilities: z.number().nullable(),
  hospital_beds_per_thousand: z.number().nullable(),
  life_expectancy: z.number().nullable(),
  human_development_index: z.number().nullable(),
  population: z.number().nullable(),
  excess_mortality_cumulative_absolute: z.number().nullable(),
  excess_mortality_cumulative: z.number().nullable(),
  excess_mortality: z.number().nullable(),
  excess_mortality_cumulative_per_million: z.number().nullable(),
});

export type CovidRow = z.infer<typeof covidRowSchema>;

const countrySchema = z.object({
  iso_code: z.string(),
  location: z.string(),
  continent: z.string().nullable(),
});

export async function fetchCovidData(isoCode: string, start?: string, end?: string): Promise<CovidRow[]> {
  const params = new URLSearchParams();
  if (start) params.set("start", start);
  if (end) params.set("end", end);
  const qs = params.toString();
  const url = `${BASE}/covid/${isoCode}${qs ? `?${qs}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`public-data API error: ${res.status}`);
  return z.array(covidRowSchema).parse(await res.json());
}

export async function fetchCountries(): Promise<z.infer<typeof countrySchema>[]> {
  const res = await fetch(`${BASE}/covid/countries`);
  if (!res.ok) throw new Error(`public-data API error: ${res.status}`);
  return z.array(countrySchema).parse(await res.json());
}

const tflCameraPropertiesSchema = z.object({
  available: z.string(),
  imageUrl: z.string(),
  videoUrl: z.string(),
  view: z.string(),
});

const tflCameraSchema = z.object({
  id: z.number(),
  tfl_id: z.string(),
  common_name: z.string(),
  place_type: z.string(),
  lat: z.number(),
  lng: z.number(),
  properties: z.string(),
});

export type TflCamera = z.infer<typeof tflCameraSchema>;

export type TflCameraParsed = Omit<TflCamera, "properties"> & {
  properties: z.infer<typeof tflCameraPropertiesSchema>;
};

export async function fetchTflCameras(type?: string): Promise<TflCameraParsed[]> {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  const qs = params.toString();
  const url = `${BASE}/tfl/cameras${qs ? `?${qs}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`public-data API error: ${res.status}`);
  const raw = z.array(tflCameraSchema).parse(await res.json());
  return raw.map((c) => ({ ...c, properties: tflCameraPropertiesSchema.parse(JSON.parse(c.properties)) }));
}
