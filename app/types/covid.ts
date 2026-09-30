import type { CovidRow } from "~/lib/public-data";

export type CovidDataRecord = CovidRow & {
  vaccinationDataDate?: string | null;
};
