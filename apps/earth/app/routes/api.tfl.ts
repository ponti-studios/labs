import { eq } from "@pontistudios/db";
import { db, tflCameras } from "@pontistudios/db";
import type { TflCamera } from "../lib/signals/earth";

export async function loader() {
  try {
    const cameras = await db.select().from(tflCameras);

    // Transform database data to match the frontend expected format
    const transformedCameras: TflCamera[] = cameras.map((camera) => ({
      id: camera.tflId,
      commonName: camera.commonName,
      available: camera.available ? "true" : "false",
      imageUrl: camera.imageUrl || "",
      videoUrl: camera.videoUrl || "",
      view: camera.view || "",
      lat: parseFloat(camera.lat as any),
      lng: parseFloat(camera.lng as any),
    }));

    return Response.json({ cameras: transformedCameras });
  } catch (error) {
    console.error("Error fetching TFL cameras:", error);
    return Response.json({ error: "Failed to fetch cameras" }, { status: 500 });
  }
}

// Individual camera endpoint
export async function getCameraById(id: string): Promise<TflCamera | undefined> {
  try {
    const camera = await db.select().from(tflCameras).where(eq(tflCameras.tflId, id)).limit(1);

    if (camera.length === 0) return undefined;

    const dbCamera = camera[0];
    return {
      id: dbCamera.tflId,
      commonName: dbCamera.commonName,
      available: dbCamera.available ? "true" : "false",
      imageUrl: dbCamera.imageUrl || "",
      videoUrl: dbCamera.videoUrl || "",
      view: dbCamera.view || "",
      lat: parseFloat(dbCamera.lat as any),
      lng: parseFloat(dbCamera.lng as any),
    };
  } catch (error) {
    console.error("Error fetching camera by ID:", error);
    return undefined;
  }
}
