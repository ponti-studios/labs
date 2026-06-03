import { Link } from "react-router";
import { useCovidCountries } from "../lib/hooks/useCovidData";

export default function Covid() {
  const { data: countries, isLoading } = useCovidCountries();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-[var(--text-muted)] font-mono text-xs tracking-widest uppercase">
          Fetching data...
        </div>
      </div>
    );
  }

  const topCountries = [...(countries ?? [])].sort((a, b) => b.cases - a.cases).slice(0, 12);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm font-mono font-semibold tracking-widest uppercase text-[var(--accent-bright)] mb-1">
          COVID-19 Tracker
        </h2>
        <p className="text-[var(--text-muted)] text-xs leading-relaxed">
          Global pandemic data — disease.sh API.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="cesium-card p-3">
          <div className="cesium-card-label">Countries</div>
          <div className="cesium-card-value">{countries?.length ?? 0}</div>
        </div>
        <div className="cesium-card p-3">
          <div className="cesium-card-label">Total Cases</div>
          <div className="cesium-card-value cesium-card-value--accent">
            {((countries ?? []).reduce((s, c) => s + c.cases, 0) / 1_000_000).toFixed(1)}M
          </div>
        </div>
      </div>

      <div>
        <div className="font-mono text-[9px] tracking-[0.15em] uppercase text-[var(--text-muted)] mb-2 pb-1 border-b border-[var(--border-default)]">
          Top 12 — By Cases
        </div>
        <ul className="space-y-0.5">
          {topCountries.map((country) => {
            const maxCases = topCountries[0].cases;
            const pct = (country.cases / maxCases) * 100;
            return (
              <li key={country.countryInfo.iso3}>
                <Link
                  to={`/covid/${country.countryInfo.iso3}`}
                  className="cesium-covid-link cesium-covid-link--critical"
                >
                  <span>{country.countryInfo.flag}</span>
                  <span className="flex-1 text-xs">{country.country}</span>
                  <span className="font-mono text-xs text-[var(--text-secondary)]">
                    {country.cases.toLocaleString()}
                  </span>
                  <div className="w-10 h-1 rounded-full bg-[var(--bg-panel-2)] overflow-hidden flex-shrink-0">
                    <div
                      className="h-full rounded-full bg-[var(--entity-covid)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
