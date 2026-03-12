import { useEffect } from "react";
import { activeTab, covidCountries, loadingCovid } from "../lib/signals/earth";
import type { CovidCountry } from "../lib/signals/earth";

export default function CovidIndex() {
  activeTab.value = "covid";

  useEffect(() => {
    if (covidCountries.value.length > 0) return;

    async function fetchCovidData() {
      loadingCovid.value = true;
      try {
        const res = await fetch("https://disease.sh/v3/covid-19/countries");
        const data: CovidCountry[] = await res.json();
        covidCountries.value = data;
      } catch (err) {
        console.error("Failed to fetch COVID data:", err);
      } finally {
        loadingCovid.value = false;
      }
    }

    fetchCovidData();
  }, []);

  if (loadingCovid.value) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-text-muted">Loading COVID data...</div>
      </div>
    );
  }

  const totalCases = covidCountries.value.reduce((sum, c) => sum + c.cases, 0);
  const totalDeaths = covidCountries.value.reduce((sum, c) => sum + c.deaths, 0);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-text-primary">COVID-19 Overview</h2>
      <p className="text-text-secondary text-sm">Global pandemic tracking with real-time data.</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-bg-panel-1 p-3 rounded">
          <div className="text-xs text-text-muted uppercase">Countries</div>
          <div className="text-lg font-bold">{covidCountries.value.length}</div>
        </div>
        <div className="bg-bg-panel-1 p-3 rounded">
          <div className="text-xs text-text-muted uppercase">Total Cases</div>
          <div className="text-lg font-bold">{totalCases.toLocaleString()}</div>
        </div>
        <div className="bg-bg-panel-1 p-3 rounded">
          <div className="text-xs text-text-muted uppercase">Total Deaths</div>
          <div className="text-lg font-bold">{totalDeaths.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
