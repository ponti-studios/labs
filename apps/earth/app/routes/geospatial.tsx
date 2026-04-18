export default function Geospatial() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm font-mono font-semibold tracking-widest uppercase text-[var(--accent-bright)] mb-1">
          Geospatial Search
        </h2>
        <p className="text-[var(--text-muted)] text-xs leading-relaxed">
          Point-in-polygon &amp; spatial queries.
        </p>
      </div>

      <div className="cesium-card p-3">
        <div className="cesium-card-label mb-2">Location Query</div>
        <div className="relative">
          <input
            type="text"
            placeholder="Enter coordinates or address..."
            className="w-full bg-[var(--bg-panel-2)] border border-[var(--border-default)] rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors font-mono"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg
              className="w-4 h-4 text-[var(--text-muted)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div>
        <div className="font-mono text-[9px] tracking-[0.15em] uppercase text-[var(--text-muted)] mb-2 pb-1 border-b border-[var(--border-default)]">
          Map Layers
        </div>
        <ul className="space-y-1">
          {[
            { name: "Country Borders", active: true },
            { name: "Major Cities", active: true },
            { name: "Airspace", active: false },
            { name: "Maritime Zones", active: false },
          ].map((layer) => (
            <li key={layer.name}>
              <button
                type="button"
                className="w-full flex items-center gap-3 p-3 cesium-card hover:border-[var(--border-active)] transition-colors text-left"
              >
                <div
                  className="w-8 h-4 rounded-sm flex items-center justify-center flex-shrink-0"
                  style={{
                    background: layer.active ? "var(--accent)" : "var(--bg-panel-2)",
                    border: "1px solid var(--border-default)",
                  }}
                >
                  {layer.active && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-[var(--text-primary)]">{layer.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="cesium-card p-6 flex flex-col items-center justify-center text-center space-y-3">
        <svg
          className="w-8 h-8 text-[var(--text-muted)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
        <div>
          <div className="text-sm text-[var(--text-secondary)] mb-1">No active queries</div>
          <div className="text-xs text-[var(--text-muted)]">
            Enter coordinates above to begin geospatial analysis.
          </div>
        </div>
      </div>
    </div>
  );
}
