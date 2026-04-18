import { Link, useParams } from "react-router";
import { useCovidCountries } from "../lib/hooks/useCovidData";

export default function CovidCountry() {
  const params = useParams();
  const iso3 = params.iso3;
  const { data: countries, isLoading } = useCovidCountries();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-sm font-mono text-[var(--text-muted)]">LOADING COUNTRY</h2>
      </div>
    );
  }

  const country = countries?.find((c) => c.countryInfo.iso3 === iso3);

  if (!country) {
    return (
      <div className="space-y-4">
        <h2 className="text-sm font-mono text-[var(--text-muted)]">COUNTRY NOT FOUND</h2>
        <Link
          to="/covid"
          className="text-xs font-mono text-[var(--accent-bright)] hover:underline tracking-wide"
        >
          ← Back to Overview
        </Link>
      </div>
    );
  }

  const mortalityRate = country.deaths / country.cases;

  return (
    <div className="space-y-5">
      <Link
        to="/covid"
        className="inline-flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors tracking-wide"
      >
        ← Overview
      </Link>

      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{country.countryInfo.flag}</span>
          <div>
            <h2 className="font-semibold text-[var(--text-primary)]">{country.country}</h2>
            <span className="font-mono text-[9px] tracking-widest uppercase text-[var(--text-muted)]">
              ISO {iso3}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="cesium-card p-3">
          <div className="cesium-card-label">Total Cases</div>
          <div className="cesium-card-value cesium-card-value--accent">
            {country.cases.toLocaleString()}
          </div>
        </div>
        <div className="cesium-card p-3">
          <div className="cesium-card-label">Deaths</div>
          <div className="cesium-card-value" style={{ color: "var(--entity-covid)" }}>
            {country.deaths.toLocaleString()}
          </div>
        </div>
        <div className="cesium-card p-3">
          <div className="cesium-card-label">Today Cases</div>
          <div className="cesium-card-value">+{country.todayCases.toLocaleString()}</div>
        </div>
        <div className="cesium-card p-3">
          <div className="cesium-card-label">Mortality</div>
          <div className="cesium-card-value">{(mortalityRate * 100).toFixed(2)}%</div>
        </div>
      </div>

      <div className="cesium-card p-3 space-y-2">
        <div className="font-mono text-[9px] tracking-[0.15em] uppercase text-[var(--text-muted)]">
          Case Distribution
        </div>
        <div className="space-y-1.5">
          <div>
            <div className="flex justify-between font-mono text-[10px] text-[var(--text-muted)] mb-0.5">
              <span>Active</span>
              <span>{country.active.toLocaleString()}</span>
            </div>
            <div className="h-1.5 bg-[var(--bg-panel-2)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--accent)]"
                style={{ width: `${(country.active / country.cases) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between font-mono text-[10px] text-[var(--text-muted)] mb-0.5">
              <span>Recovered</span>
              <span>{country.recovered.toLocaleString()}</span>
            </div>
            <div className="h-1.5 bg-[var(--bg-panel-2)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--status-online)]"
                style={{ width: `${(country.recovered / country.cases) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between font-mono text-[10px] text-[var(--text-muted)] mb-0.5">
              <span>Deaths</span>
              <span>{country.deaths.toLocaleString()}</span>
            </div>
            <div className="h-1.5 bg-[var(--bg-panel-2)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--entity-covid)]"
                style={{ width: `${mortalityRate * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="cesium-card p-3">
        <div className="cesium-card-label mb-1">Location</div>
        <div className="font-mono text-xs text-[var(--text-secondary)]">
          {country.countryInfo.lat.toFixed(4)}°, {country.countryInfo.long.toFixed(4)}°
        </div>
      </div>
    </div>
  );
}
