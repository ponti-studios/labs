import { Link } from "react-router";
import { activeTab } from "../lib/signals/earth";
import { useCovidCountries } from "../lib/hooks/useCovidData";

export default function Covid() {
  activeTab.value = "covid";
  const { data: countries, isLoading } = useCovidCountries();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-text-muted">Loading COVID data...</div>
      </div>
    );
  }

  const topCountries = [...(countries ?? [])].sort((a, b) => b.cases - a.cases).slice(0, 10);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-text-primary">COVID-19 Tracker</h2>
      <p className="text-text-secondary text-sm">
        Global pandemic tracking with real-time data from disease.sh API.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-bg-panel-1 p-3 rounded">
          <div className="text-xs text-text-muted uppercase">Countries</div>
          <div className="text-lg font-bold">{countries?.length ?? 0}</div>
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
