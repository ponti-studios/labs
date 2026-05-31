import { populateTflCameras as populateTflCamerasFromDb } from "../../packages/db/src/loaders/tfl";

populateTflCamerasFromDb().catch((error) => {
  console.error("Population failed:", error);
  process.exit(1);
});

export { populateTflCamerasFromDb as populateTflCameras };
