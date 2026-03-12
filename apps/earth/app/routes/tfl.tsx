import { useEffect } from "react";
import { Link } from "react-router";
import { activeTab, tflCameras, loadingTfl } from "../lib/signals/earth";
import type { TflCamera } from "../lib/signals/earth";

export default function Tfl() {
  activeTab.value = "tfl";

  useEffect(() => {
    if (tflCameras.value.length > 0) return;

    async function fetchTflData() {
      loadingTfl.value = true;
      try {
        const mockCameras: TflCamera[] = [
          {
            id: "cam001",
            available: "true",
            commonName: "Tower Bridge",
            videoUrl: "",
            view: "north",
            imageUrl: "",
            lat: 51.5055,
            lng: -0.0754,
          },
          {
            id: "cam002",
            available: "true",
            commonName: "Oxford Circus",
            videoUrl: "",
            view: "south",
            imageUrl: "",
            lat: 51.5152,
            lng: -0.1419,
          },
          {
            id: "cam003",
            available: "false",
            commonName: "Piccadilly Circus",
            videoUrl: "",
            view: "east",
            imageUrl: "",
            lat: 51.51,
            lng: -0.1348,
          },
          {
            id: "cam004",
            available: "true",
            commonName: "Westminster",
            videoUrl: "",
            view: "west",
            imageUrl: "",
            lat: 51.501,
            lng: -0.1246,
          },
          {
            id: "cam005",
            available: "true",
            commonName: "London Bridge",
            videoUrl: "",
            view: "north",
            imageUrl: "",
            lat: 51.5079,
            lng: -0.0877,
          },
        ];
        tflCameras.value = mockCameras;
      } catch (err) {
        console.error("Failed to fetch TfL data:", err);
      } finally {
        loadingTfl.value = false;
      }
    }

    fetchTflData();
  }, []);

  if (loadingTfl.value) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-text-muted">Loading TfL cameras...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">TfL Traffic Cameras</h2>
      <p className="text-text-secondary text-sm">Live traffic cameras across London.</p>
      <div className="space-y-2">
        {tflCameras.value.slice(0, 10).map((camera) => (
          <Link
            key={camera.id}
            to={`/tfl/${camera.id}`}
            className="block bg-bg-panel-1 p-3 rounded hover:bg-bg-panel-2 transition-colors"
          >
            <div className="font-medium text-text-primary">{camera.commonName}</div>
            <div className="text-xs text-text-muted">
              {camera.available === "true" ? "● Available" : "○ Unavailable"}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
