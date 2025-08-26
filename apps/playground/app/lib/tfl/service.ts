import { eq } from "drizzle-orm";
import { db, tflCameras } from "~/db/index";
import type { Cameras } from "./types";

export async function getCameras(): Promise<Cameras> {
	try {
		const cameras = await db.select().from(tflCameras);

		// Transform database data to match the frontend expected format
		return cameras.map((camera) => ({
			id: camera.tflId,
			commonName: camera.commonName,
			available: camera.available ? "true" : "false",
			imageUrl: camera.imageUrl || "",
			videoUrl: camera.videoUrl || "",
			view: camera.view || "",
			lat: camera.lat,
			lng: camera.lng,
		}));
	} catch (error) {
		console.error("Error fetching TFL cameras:", error);
		return [];
	}
}

export async function getCameraById(
	id: string,
): Promise<Cameras[0] | undefined> {
	try {
		const camera = await db
			.select()
			.from(tflCameras)
			.where(eq(tflCameras.tflId, id))
			.limit(1);

		if (camera.length === 0) return undefined;

		const dbCamera = camera[0];
		return {
			id: dbCamera.tflId,
			commonName: dbCamera.commonName,
			available: dbCamera.available ? "true" : "false",
			imageUrl: dbCamera.imageUrl || "",
			videoUrl: dbCamera.videoUrl || "",
			view: dbCamera.view || "",
			lat: dbCamera.lat,
			lng: dbCamera.lng,
		};
	} catch (error) {
		console.error("Error fetching camera by ID:", error);
		return undefined;
	}
}
