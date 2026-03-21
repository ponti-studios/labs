import { activeTab } from "../lib/signals/earth";
import { useCovidCountries } from "../lib/hooks/useCovidData";

export default function CovidIndex() {
  activeTab.value = "covid";
  const { data: countries, isLoading } = useCovidCountries();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-text-muted">Loading COVID data...</div>
      </div>
    );
  }

  const totalCases = (countries ?? []).reduce((sum, c) => sum + c.cases, 0);
  const totalDeaths = (countries ?? []).reduce((sum, c) => sum + c.deaths, 0);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-text-primary">COVID-19 Overview</h2>
      <p className="text-text-secondary text-sm">Global pandemic tracking with real-time data.</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-bg-panel-1 p-3 rounded">
          <div className="text-xs text-text-muted uppercase">Countries</div>
          <div className="text-lg font-bold">{countries?.length ?? 0}</div>
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
