import { Link, useParams } from "react-router";
import { useTflCameras } from "../lib/hooks/useOrbitData";

export default function TflCamera() {
  const params = useParams();
  const { data: cameras, isLoading } = useTflCameras();
  const camera = cameras?.find((c) => c.id === params.cameraId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-sm font-mono text-[var(--text-muted)]">LOADING CAMERA</h2>
      </div>
    );
  }

  if (!camera) {
    return (
      <div className="space-y-4">
        <h2 className="text-sm font-mono text-[var(--text-muted)]">CAMERA NOT FOUND</h2>
        <Link
          to="/tfl"
          className="text-xs font-mono text-[var(--accent-bright)] hover:underline tracking-wide"
        >
          ← Back to Cameras
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link
        to="/tfl"
        className="inline-flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors tracking-wide"
      >
        ← Cameras
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-semibold text-[var(--text-primary)] mb-1">{camera.commonName}</h2>
          <span className="font-mono text-[9px] tracking-widest uppercase text-[var(--text-muted)]">
            Camera {camera.id}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`cesium-status-dot cesium-status-dot--${camera.available === "true" ? "online" : "offline"}`}
          />
          <span
            className="font-mono text-[9px] tracking-wider"
            style={{
              color: camera.available === "true" ? "var(--status-online)" : "var(--text-muted)",
            }}
          >
            {camera.available === "true" ? "LIVE" : "OFFLINE"}
          </span>
        </div>
      </div>

      <div
        className="cesium-card w-full aspect-video flex items-center justify-center relative overflow-hidden"
        style={{ background: "var(--bg-panel-2)" }}
      >
        {camera.imageUrl ? (
          <img
            src={camera.imageUrl}
            alt={camera.commonName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-3">
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
                d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.89L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <span className="font-mono text-[9px] tracking-widest uppercase text-[var(--text-muted)]">
              No Feed Available
            </span>
          </div>
        )}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(78,207,78,1) 2px, rgba(78,207,78,1) 4px)",
          }}
        />
      </div>

      <div className="space-y-2">
        <div className="font-mono text-[9px] tracking-[0.15em] uppercase text-[var(--text-muted)] pb-1 border-b border-[var(--border-default)]">
          Camera Metadata
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="cesium-card p-3">
            <div className="cesium-card-label">View Direction</div>
            <div className="cesium-card-value">{camera.view.toUpperCase()}</div>
          </div>
          <div className="cesium-card p-3">
            <div className="cesium-card-label">Status</div>
            <div
              className="cesium-card-value"
              style={{
                color: camera.available === "true" ? "var(--status-online)" : "var(--text-muted)",
              }}
            >
              {camera.available === "true" ? "Online" : "Offline"}
            </div>
          </div>
          <div className="cesium-card p-3 col-span-2">
            <div className="cesium-card-label">Coordinates</div>
            <div className="font-mono text-xs text-[var(--text-secondary)]">
              {camera.lat.toFixed(6)}°, {camera.lng.toFixed(6)}°
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
