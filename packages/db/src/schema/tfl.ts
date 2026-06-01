import { boolean, real, serial, text, timestamp } from "drizzle-orm/pg-core";
import { labs } from "./base";

export const tflCameras = labs.table("tfl_cameras", {
  id: serial("id").primaryKey(),
  tflId: text("tfl_id").notNull(),
  commonName: text("common_name").notNull(),
  available: boolean("available"),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  view: text("view"),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type TflCamera = typeof tflCameras.$inferSelect;
export type NewTflCamera = typeof tflCameras.$inferInsert;
