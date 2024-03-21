/**
 * This cron job fetches the first photo of a place from the Google Places API
 * and updates the place with the photo URL.
 */

import { prisma } from "@hominem/db";
import { FastifyInstance } from "fastify";

async function migrateLatLngFloat(server: FastifyInstance) {
  let count = 0;
  const places = await prisma.place.findMany({
    where: {
      lat: { not: null },
      lng: { not: null },
    },
  });

  if (!places.length) {
    return;
  }

  for (const place of places) {
    if (place.lat && place.lng) {
      await prisma.place.update({
        where: { id: place.id },
        data: {
          lat: null,
          lng: null,
          latitude: parseFloat(place.lat),
          longitude: parseFloat(place.lng),
        },
      });
      count += 1;
    }
  }

  // Send email to admin
  server.sendEmail(
    process.env.SENDGRID_SENDER_EMAIL as string,
    "All places have been updated with photos",
    "All places have been updated with photos",
    `<p>${count} places have been updated with valid image URLs</p>`,
  );
}

export default migrateLatLngFloat;
