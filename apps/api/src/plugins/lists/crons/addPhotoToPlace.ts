// Fastify cron that uses the Google Places API to add a photo to all places in the database.

import { FastifyInstance } from "fastify";
import { prisma } from "../../prisma";
import { getPlacePhoto } from "../../google-places";

async function addPhotoToPlace(server: FastifyInstance) {
  const places = await prisma.place.findMany();

  if (!places.length) {
    return;
  }

  for (const place of places) {
    if (place.imageUrl) {
      continue;
    }

    if (!place.googleMapsId) {
      continue;
    }

    const photo = await getPlacePhoto(place.googleMapsId);

    if (photo) {
      await prisma.place.update({
        where: { id: place.id },
        data: { imageUrl: photo },
      });
    }
  }

  // Send email to admin
  server.sendEmail(
    process.env.SENDGRID_SENDER_EMAIL as string,
    "All places have been updated with photos",
    "All places have been updated with photos",
    `<p>All places have been updated with photos</p>`,
  );
}

export default addPhotoToPlace;
