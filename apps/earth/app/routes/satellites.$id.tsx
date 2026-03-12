import { activeTab, satellites, selectedSatelliteId } from "../lib/signals/earth";

export default function SatelliteDetail() {
  activeTab.value = "satellites";

  const sat = satellites.value.find((s) => s.id === selectedSatelliteId.value);

  if (!sat) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Satellite Not Found</h2>
        <a href="/satellites" className="text-blue-500 hover:underline">
          Back to Satellites
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <a href="/satellites" className="text-sm text-text-muted hover:underline">
        ← Back to Satellites
      </a>
      <h2 className="text-xl font-bold">{sat.name}</h2>
      <div className="bg-bg-panel-1 p-3 rounded space-y-2">
        <div>Altitude: {(sat.altitude / 1000).toFixed(1)} km</div>
        <div>Velocity: {sat.velocity.toFixed(1)} km/h</div>
      </div>
    </div>
  );
}
