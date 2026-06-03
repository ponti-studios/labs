import { useMemo } from "react";
import { Link } from "react-router";
import { useTflCameras } from "../lib/hooks/useOrbitData";

export default function Tfl() {
  const { data: cameras, isLoading } = useTflCameras();

  const online = useMemo(
    () => (cameras ?? []).filter((c) => c.available === "true").length,
    [cameras],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-[var(--text-muted)] font-mono text-xs tracking-widest uppercase">
          Loading cameras...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm font-mono font-semibold tracking-widest uppercase text-[var(--accent-bright)] mb-1">
          TfL Traffic Network
        </h2>
        <p className="text-[var(--text-muted)] text-xs leading-relaxed">
          London traffic camera feeds.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="cesium-card p-3">
          <div className="cesium-card-label">Cameras</div>
          <div className="cesium-card-value">{cameras?.length ?? 0}</div>
        </div>
        <div className="cesium-card p-3">
          <div className="cesium-card-label">Online</div>
          <div className="cesium-card-value cesium-card-value--accent">{online}</div>
        </div>
      </div>

      <div>
        <div className="font-mono text-[9px] tracking-[0.15em] uppercase text-[var(--text-muted)] mb-2 pb-1 border-b border-[var(--border-default)]">
          Camera Feeds
        </div>
        <ul className="space-y-1">
          {cameras?.map((camera) => (
            <li key={camera.id}>
              <Link
                to={`/tfl/${camera.id}`}
                className="cesium-card flex items-center gap-3 p-3 hover:border-[var(--border-active)] transition-colors"
              >
                <span
                  className={`cesium-status-dot cesium-status-dot--${camera.available === "true" ? "online" : "offline"}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[var(--text-primary)] text-sm truncate">
                    {camera.commonName}
                  </div>
                  <div className="font-mono text-[10px] text-[var(--text-muted)]">
                    {camera.lat.toFixed(4)}, {camera.lng.toFixed(4)}
                  </div>
                </div>
                <div className="font-mono text-[9px] tracking-wider uppercase text-[var(--text-muted)] flex-shrink-0">
                  {camera.available === "true" ? (
                    <span className="text-[var(--status-online)]">LIVE</span>
                  ) : (
                    <span className="text-[var(--text-muted)]">OFF</span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
