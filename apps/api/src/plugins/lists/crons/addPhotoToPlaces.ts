// Fastify cron that uses the Google Places API to add a photo to all places in the database.

import { FastifyInstance } from "fastify";
import { prisma } from "../../prisma";
import { places as placesClient } from "../../google";

const isValidImageUrl = (url: string) => {
  return url ? url.indexOf("googleusercontent") !== -1 : false;
};

async function addPhotoToPlaces(server: FastifyInstance) {
  let count = 0;
  const places = await prisma.place.findMany();

  if (!places.length) {
    return;
  }

  for (const place of places) {
    // Skip places that already have a valid image
    if (place.imageUrl && !isValidImageUrl(place.imageUrl)) {
      continue;
    }

    // Skip places that don't have a googleMapsId
    if (!place.googleMapsId) {
      continue;
    }

    const { data } = await placesClient.get({
      name: `places/${place.googleMapsId}`,
      fields: "photos",
    });

    if (!data) {
      console.error("Error fetching place", { id: place.id });
      continue;
    }

    const { photos } = data;

    if (!photos) {
      console.error("No photos found for place", { id: place.id });
      continue;
    }

    const media = await placesClient.photos.getMedia({
      name: `${photos[0].name}/media`,
      maxHeightPx: 300,
    });

    if (media.data.photoUri && isValidImageUrl(media.data.photoUri)) {
      await prisma.place.update({
        where: { id: place.id },
        data: { imageUrl: media.data.photoUri },
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

export default addPhotoToPlaces;
