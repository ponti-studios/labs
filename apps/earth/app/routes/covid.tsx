import { useEffect } from "react";
import { Link } from "react-router";
import { activeTab, covidCountries, loadingCovid } from "../lib/signals/earth";
import type { CovidCountry } from "../lib/signals/earth";

export default function Covid() {
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

  const topCountries = [...covidCountries.value].sort((a, b) => b.cases - a.cases).slice(0, 10);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-text-primary">COVID-19 Tracker</h2>
      <p className="text-text-secondary text-sm">
        Global pandemic tracking with real-time data from disease.sh API.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-bg-panel-1 p-3 rounded">
          <div className="text-xs text-text-muted uppercase">Countries</div>
          <div className="text-lg font-bold">{covidCountries.value.length}</div>
        </div>
      </div>
      <div className="space-y-2 mt-4">
        <h3 className="text-sm font-semibold text-text-primary">Top Countries by Cases</h3>
        <ul className="space-y-1">
          {topCountries.map((country) => (
            <li key={country.countryInfo.iso3}>
              <Link
                to={`/covid/${country.countryInfo.iso3}`}
                className="flex items-center gap-2 p-2 rounded hover:bg-bg-panel-1 transition-colors"
              >
                <span>{country.countryInfo.flag}</span>
                <span className="text-sm text-text-primary flex-1">{country.country}</span>
                <span className="text-sm text-text-secondary">
                  {country.cases.toLocaleString()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
