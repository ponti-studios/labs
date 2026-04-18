import { Link, useParams } from "react-router";
import { useSatellites } from "../lib/hooks/useOrbitData";

export default function SatelliteDetail() {
  const params = useParams();
  const { data: satellites, isLoading } = useSatellites();
  const sat = satellites?.find((s) => s.id === params.id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-sm font-mono text-[var(--text-muted)]">LOADING SATELLITE</h2>
      </div>
    );
  }

  if (!sat) {
    return (
      <div className="space-y-4">
        <h2 className="text-sm font-mono text-[var(--text-muted)]">SATELLITE NOT FOUND</h2>
        <Link
          to="/satellites"
          className="text-xs font-mono text-[var(--accent-bright)] hover:underline tracking-wide"
        >
          ← Back to Tracker
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link
        to="/satellites"
        className="inline-flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors tracking-wide"
      >
        ← Tracker
      </Link>

      <div>
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="font-semibold text-[var(--text-primary)] mb-1">{sat.name}</h2>
            <div className="cesium-satellite-badge cesium-satellite-badge--iss">
              {sat.type.toUpperCase()}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="cesium-status-dot cesium-status-dot--online" />
            <span className="font-mono text-[9px] text-[var(--status-online)] tracking-wider">
              TRACKING
            </span>
          </div>
        </div>
      </div>

      <div>
        <div className="font-mono text-[9px] tracking-[0.15em] uppercase text-[var(--text-muted)] mb-2 pb-1 border-b border-[var(--border-default)]">
          Telemetry
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Altitude", value: `${sat.altitude.toLocaleString()} km`, accent: true },
            { label: "Velocity", value: `${sat.velocity.toLocaleString()} km/h`, accent: false },
            { label: "Latitude", value: `${sat.latitude.toFixed(4)}°`, accent: false },
            { label: "Longitude", value: `${sat.longitude.toFixed(4)}°`, accent: false },
          ].map(({ label, value, accent }) => (
            <div key={label} className="cesium-card p-3">
              <div className="cesium-card-label">{label}</div>
              <div className={`cesium-card-value${accent ? " cesium-card-value--accent" : ""}`}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="cesium-card p-4 flex flex-col items-center">
        <div className="font-mono text-[9px] tracking-[0.15em] uppercase text-[var(--text-muted)] mb-4">
          Orbit Path
        </div>
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border border-[var(--border-default)]" />
          <div className="absolute inset-3 rounded-full border border-[var(--border-default)]" />
          <div className="absolute inset-6 rounded-full border border-[var(--border-default)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-[var(--status-online)] shadow-[0_0_8px_var(--status-online)] animate-pulse" />
          </div>
          <div
            className="absolute w-1.5 h-1.5 rounded-full bg-[var(--accent-bright)]"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              boxShadow: "0 0 4px var(--accent-bright)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
