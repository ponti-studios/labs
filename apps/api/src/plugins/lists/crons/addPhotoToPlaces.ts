// Fastify cron that uses the Google Places API to add a photo to all places in the database.

import { FastifyInstance } from "fastify";
import { prisma } from "../../prisma";
import { places as placesClient } from "../../google";

async function addPhotoToPlaces(server: FastifyInstance) {
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

    const { data } = await placesClient.get({
      name: `places/${place.googleMapsId}`,
      fields: "photos",
    });

    if (!data) {
      continue;
    }

    const { photos } = data;

    if (!photos) {
      continue;
    }

    const media = await placesClient.photos.getMedia({
      name: `${photos[0].name}/media`,
      maxHeightPx: 300,
    });

    if (media.data.photoUri) {
      await prisma.place.update({
        where: { id: place.id },
        data: { imageUrl: media.data.photoUri },
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

export default addPhotoToPlaces;
