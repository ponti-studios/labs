import type { CovidData } from "~/lib/server/db";

export type CovidDataRecord = CovidData & {
  vaccinationDataDate?: string | null;
};
