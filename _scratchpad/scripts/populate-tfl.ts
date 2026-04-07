import { db, tflCameras } from "../app/db/index";
import formattedCameras from "../app/lib/tfl/cameras-formatted.json";

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
    await db.delete(tflCameras);

    // Insert new data
    console.log(`Inserting ${formattedCameras.length} TFL cameras...`);

    const insertData = formattedCameras.map((camera: FormattedCamera) => ({
      tflId: camera.id,
      commonName: camera.commonName,
      available: camera.available === "true",
      imageUrl: camera.imageUrl,
      videoUrl: camera.videoUrl,
      view: camera.view,
      lat: camera.lat,
      lng: camera.lng,
    }));

    // Insert in batches for better performance
    const batchSize = 100;
    for (let i = 0; i < insertData.length; i += batchSize) {
      const batch = insertData.slice(i, i + batchSize);
      await db.insert(tflCameras).values(batch);
      console.log(
        `Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
          insertData.length / batchSize
        )}`
      );
    }

    console.log("TFL cameras population completed successfully!");

    // Verify the data
    const count = await db.select().from(tflCameras);
    console.log(`Total cameras in database: ${count.length}`);
  } catch (error) {
    console.error("Error populating TFL cameras:", error);
    process.exit(1);
  }
}

// Run the population if this file is executed directly
if (require.main === module) {
  populateTflCameras()
    .then(() => {
      console.log("Population completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Population failed:", error);
      process.exit(1);
    });
}

export { populateTflCameras };
