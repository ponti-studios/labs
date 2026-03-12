import { useEffect } from "react";
import { Link } from "react-router";
import { activeTab, satellites, loadingSatellites } from "../lib/signals/earth";
import type { Satellite } from "../lib/signals/earth";

export default function Satellites() {
  activeTab.value = "satellites";

  useEffect(() => {
    if (satellites.value.length > 0) return;

    async function fetchSatelliteData() {
      loadingSatellites.value = true;
      try {
        const mockSatellites: Satellite[] = [
          {
            id: "iss",
            name: "International Space Station",
            type: "iss",
            latitude: 51.5074,
            longitude: -0.1276,
            altitude: 420,
            velocity: 27600,
            timestamp: new Date(),
          },
          {
            id: "tiangong",
            name: "Tiangong Space Station",
            type: "space-station",
            latitude: 40.7128,
            longitude: -74.006,
            altitude: 390,
            velocity: 27500,
            timestamp: new Date(),
          },
          {
            id: "hubble",
            name: "Hubble Space Telescope",
            type: "satellite",
            latitude: 34.0522,
            longitude: -118.2437,
            altitude: 540,
            velocity: 27400,
            timestamp: new Date(),
          },
        ];
        satellites.value = mockSatellites;
      } catch (err) {
        console.error("Failed to fetch satellite data:", err);
      } finally {
        loadingSatellites.value = false;
      }
    }

    fetchSatelliteData();
  }, []);

  if (loadingSatellites.value) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-text-muted">Loading satellites...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Satellite Tracker</h2>
      <p className="text-text-secondary text-sm">
        Real-time tracking of the International Space Station and other satellites.
      </p>
      <div className="space-y-2">
        {satellites.value.map((sat) => (
          <Link
            key={sat.id}
            to={`/satellites/${sat.id}`}
            className="block bg-bg-panel-1 p-3 rounded hover:bg-bg-panel-2 transition-colors"
          >
            <div className="font-medium text-text-primary">{sat.name}</div>
            <div className="text-xs text-text-muted">
              Alt: {(sat.altitude / 1000).toFixed(1)} km | Vel: {sat.velocity.toLocaleString()} km/h
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
