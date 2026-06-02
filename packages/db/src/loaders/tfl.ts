import fs from "node:fs/promises";
import path from "node:path";

import { db } from "../drizzle";
import { tflCameras, type NewTflCamera } from "../schema/tfl";

export interface FormattedTflCamera {
  commonName: string;
  lat: number;
  lng: number;
  id: string;
  available: string;
  videoUrl: string;
  view: string;
  imageUrl: string;
}

export type PopulateTflOptions = {
  sourcePath?: string;
  clearExisting?: boolean;
};

function getDefaultSourcePath() {
  return path.join(process.cwd(), "apps/labyrinth/app/lib/tfl/cameras-formatted.json");
}

async function readFormattedCameras(sourcePath: string): Promise<FormattedTflCamera[]> {
  const raw = await fs.readFile(sourcePath, "utf8");
  return JSON.parse(raw) as FormattedTflCamera[];
}

export async function populateTflCameras(options: PopulateTflOptions = {}) {
  const sourcePath = options.sourcePath ?? getDefaultSourcePath();
  const clearExisting = options.clearExisting ?? true;
  const formattedCameras = await readFormattedCameras(sourcePath);

  console.log("Starting TFL cameras population...");

  if (clearExisting) {
    console.log("Clearing existing TFL camera data...");
    await db.delete(tflCameras);
  }

  console.log(`Inserting ${formattedCameras.length} TFL cameras...`);

  const insertData: NewTflCamera[] = formattedCameras.map((camera) => ({
    tflId: camera.id,
    commonName: camera.commonName,
    available: camera.available === "true",
    imageUrl: camera.imageUrl,
    videoUrl: camera.videoUrl,
    view: camera.view,
    lat: Number(camera.lat),
    lng: Number(camera.lng),
  }));

  const batchSize = 100;
  for (let index = 0; index < insertData.length; index += batchSize) {
    const batch = insertData.slice(index, index + batchSize);
    await db.insert(tflCameras).values(batch);
    console.log(
      `Inserted batch ${Math.floor(index / batchSize) + 1}/${Math.ceil(insertData.length / batchSize)}`,
    );
  }

  const count = await db.select().from(tflCameras);
  console.log(
    `TFL cameras population completed successfully! Total cameras in database: ${count.length}`,
  );
}
