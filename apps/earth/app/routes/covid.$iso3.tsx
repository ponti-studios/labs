import { useParams, Link } from "react-router";
import { activeTab, covidCountries, selectedCountryIso3 } from "../lib/signals/earth";

export default function CovidCountry() {
  const params = useParams();
  const iso3 = params.iso3;

  activeTab.value = "covid";
  selectedCountryIso3.value = iso3 ?? null;

  const country = covidCountries.value.find((c) => c.countryInfo.iso3 === iso3);

  if (!country) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Country Not Found</h2>
        <Link to="/covid" className="text-blue-500 hover:underline">
          Back to COVID overview
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link to="/covid" className="text-sm text-text-muted hover:underline">
        ← Back to Overview
      </Link>
      <h2 className="text-xl font-bold">{country.country}</h2>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-bg-panel-1 p-3 rounded">
          <div className="text-xs text-text-muted">Cases</div>
          <div className="text-lg font-bold">{country.cases.toLocaleString()}</div>
        </div>
        <div className="bg-bg-panel-1 p-3 rounded">
          <div className="text-xs text-text-muted">Deaths</div>
          <div className="text-lg font-bold">{country.deaths.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
