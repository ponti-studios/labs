import { useMemo } from "react";
import { Link } from "react-router";
import { useSatellites } from "../lib/hooks/useOrbitData";

const TYPE_LABELS = {
  iss: "ISS",
  "space-station": "CSS",
  satellite: "SAT",
} as const;

export default function Satellites() {
  const { data: satellites, isLoading } = useSatellites();

  const orderedSatellites = useMemo(
    () => [...(satellites ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
    [satellites],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-[var(--text-muted)] font-mono text-xs tracking-widest uppercase">
          Tracking...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm font-mono font-semibold tracking-widest uppercase text-[var(--accent-bright)] mb-1">
          Satellite Tracker
        </h2>
        <p className="text-[var(--text-muted)] text-xs leading-relaxed">
          ISS, space stations &amp; orbital assets.
        </p>
      </div>

      <div>
        <div className="font-mono text-[9px] tracking-[0.15em] uppercase text-[var(--text-muted)] mb-2 pb-1 border-b border-[var(--border-default)]">
          Orbital Assets — {orderedSatellites.length}
        </div>
        <ul className="space-y-2">
          {orderedSatellites.map((sat) => (
            <li key={sat.id}>
              <Link
                to={`/satellites/${sat.id}`}
                className="cesium-card block p-3 hover:border-[var(--border-active)] transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium text-[var(--text-primary)] text-sm mb-1">
                      {sat.name}
                    </div>
                    <div className="cesium-satellite-badge cesium-satellite-badge--iss">
                      {TYPE_LABELS[sat.type]}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="cesium-status-dot cesium-status-dot--online" />
                    <span className="font-mono text-[9px] text-[var(--status-online)] tracking-wider">
                      TRACKING
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-[var(--border-default)]">
                  <div>
                    <div className="cesium-card-label">ALT</div>
                    <div className="font-mono text-xs text-[var(--text-secondary)]">
                      {sat.altitude.toLocaleString()} km
                    </div>
                  </div>
                  <div>
                    <div className="cesium-card-label">VEL</div>
                    <div className="font-mono text-xs text-[var(--text-secondary)]">
                      {sat.velocity.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="cesium-card-label">LAT</div>
                    <div className="font-mono text-xs text-[var(--text-secondary)]">
                      {sat.latitude.toFixed(2)}°
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
