import { Link } from "react-router";
import { useCovidCountries } from "../lib/hooks/useCovidData";

export default function Index() {
  const { data: countries } = useCovidCountries();

  const totalCases = (countries ?? []).reduce((sum, c) => sum + c.cases, 0);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm font-mono font-semibold tracking-widest uppercase text-[var(--accent-bright)] mb-1">
          Global Overview
        </h2>
        <p className="text-[var(--text-muted)] text-xs leading-relaxed">
          Select a data layer to explore.
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
            {countries ? `${(totalCases / 1_000_000).toFixed(1)}M` : "—"}
          </div>
        </div>
      </div>

      <div className="space-y-1">
        {[
          { tab: "covid", label: "COVID-19 Data", desc: "Global pandemic metrics" },
          { tab: "satellites", label: "Satellite Tracking", desc: "ISS & orbital assets" },
          { tab: "tfl", label: "TfL Network", desc: "London traffic cameras" },
          { tab: "geospatial", label: "Geospatial Search", desc: "Location queries" },
        ].map((item) => (
          <Link
            key={item.tab}
            to={`/${item.tab}`}
            className="cesium-card flex items-center gap-3 p-3 hover:border-[var(--border-active)] transition-colors"
          >
            <div className="flex-1">
              <div className="text-[var(--text-primary)] text-sm font-medium">{item.label}</div>
              <div className="text-[var(--text-muted)] text-xs">{item.desc}</div>
            </div>
            <svg
              className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
