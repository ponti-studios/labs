import { useParams, Link } from "react-router";
import { activeTab, tflCameras, selectedCameraId } from "../lib/signals/earth";

export default function TflCamera() {
  const params = useParams();

  activeTab.value = "tfl";
  selectedCameraId.value = params.cameraId ?? null;

  const camera = tflCameras.value.find((c) => c.id === params.cameraId);

  if (!camera) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Camera Not Found</h2>
        <Link to="/tfl" className="text-blue-500 hover:underline">
          Back to Cameras
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link to="/tfl" className="text-sm text-text-muted hover:underline">
        ← Back to Cameras
      </Link>
      <h2 className="text-xl font-bold">{camera.commonName}</h2>
      <div className="bg-bg-panel-1 p-3 rounded">
        <div className="text-sm text-text-muted">
          {camera.available === "true" ? "● Available" : "○ Unavailable"}
        </div>
      </div>
    </div>
  );
}
