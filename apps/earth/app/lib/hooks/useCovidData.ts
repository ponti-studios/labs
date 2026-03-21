import { useQuery } from "@tanstack/react-query";
import type { CovidCountry } from "../signals/earth";

async function fetchCovidCountries(): Promise<CovidCountry[]> {
  const res = await fetch("https://disease.sh/v3/covid-19/countries");
  if (!res.ok) throw new Error("Failed to fetch COVID data");
  return res.json();
}

export function useCovidCountries() {
  return useQuery({
    queryKey: ["covid", "countries"],
    queryFn: fetchCovidCountries,
  });
}
