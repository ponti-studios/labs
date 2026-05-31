import { populateTflCameras } from "../loaders/tfl";

populateTflCameras().catch((error) => {
  console.error("TFL population failed:", error);
  process.exit(1);
});
