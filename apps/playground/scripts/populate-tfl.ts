import "dotenv/config";
import { getDb } from "@pontistudios/db";
import formattedCameras from "../app/lib/tfl/cameras-formatted.json";

const db = await getDb();

interface FormattedCamera {
	commonName: string;
	lat: number;
	lng: number;
	id: string;
	available: string;
	videoUrl: string;
	view: string;
	imageUrl: string;
}

async function populateTflCameras() {
	console.log("Starting TFL cameras population...");

	try {
		// Clear existing data
		console.log("Clearing existing TFL camera data...");
		await db.deleteFrom("tfl_cameras").execute();

		// Insert new data
		console.log(`Inserting ${formattedCameras.length} TFL cameras...`);

		// Insert in batches for better performance
		const batchSize = 100;
		for (let i = 0; i < formattedCameras.length; i += batchSize) {
			const batch = formattedCameras.slice(i, i + batchSize);
			const values = batch.map((camera: FormattedCamera) => ({
				tfl_id: camera.id,
				common_name: camera.commonName,
				available: camera.available === "true" ? 1 : 0,
				image_url: camera.imageUrl || null,
				video_url: camera.videoUrl || null,
				view: camera.view || null,
				lat: camera.lat,
				lng: camera.lng,
			}));

			await db.insertInto("tfl_cameras").values(values).execute();
			console.log(
				`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(formattedCameras.length / batchSize)}`,
			);
		}

		console.log("TFL cameras population completed successfully!");

		// Verify the data
		const count = await db.selectFrom("tfl_cameras").select("id").execute();
		console.log(`Total cameras in database: ${count.length}`);
	} catch (error) {
		console.error("Error populating TFL cameras:", error);
		process.exit(1);
	}
}

// Run the population if this file is executed directly

populateTflCameras()
	.then(() => {
		console.log("Population completed!");
		process.exit(0);
	})
	.catch((error) => {
		console.error("Population failed:", error);
		process.exit(1);
	});
