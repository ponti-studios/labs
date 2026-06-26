import type { CovidData } from "@pontistudios/db";

export type CovidDataRecord = CovidData & {
  vaccinationDataDate?: string | null;
};
