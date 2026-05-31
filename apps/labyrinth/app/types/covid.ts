import type { CovidData } from "@pontistudios/db";

export type CovidDataRecord = CovidData & {
  vaccinationDataDate?: string | null;
};

export interface CovidApiResponse {
  data: CovidDataRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    country: string | null;
    startDate: string | null;
    endDate: string | null;
  };
}

export interface CountryResponse {
  data: Array<{
    name: string;
    code: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
