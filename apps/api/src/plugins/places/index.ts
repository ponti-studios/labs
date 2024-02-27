import {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest,
} from "fastify";

import { SessionToken } from "../../typings";

import { verifySession } from "../auth";
import {
  getPlaceDetails,
  getPlacePhotos,
  searchPlaces,
} from "../google/places";

const PlacesPlugin: FastifyPluginAsync = async (server: FastifyInstance) => {
  server.get(
    "/places/:id",
    {
      preValidation: verifySession,
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              address: { type: "string" },
              lat: { type: "number" },
              lng: { type: "number" },
              name: { type: "string" },
              googleMapsId: { type: "string" },
              imageUrl: { type: "string" },
              phoneNumber: { type: "string" },
              photos: { type: "array", items: { type: "string" } },
              types: { type: "array", items: { type: "string" } },
              websiteUri: { type: "string" },
            },
          },
          404: {
            type: "null",
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = request.session.get("data") as SessionToken;
      const { id } = request.params as { id: string };

      try {
        const place = await server.prisma.place.findFirst({
          where: { googleMapsId: id },
        });

        // Serve the place from the database if it exists.
        if (place && place.googleMapsId) {
          const photos = await getPlacePhotos({
            googleMapsId: place.googleMapsId,
            placeId: place.id,
            limit: 5,
          });

          return reply.code(200).send({
            ...place,
            photos: photos?.map((photo) => photo.imageUrl) || [],
          });
        }

        // If this place has not been saved before, fetch it from Google.
        const googlePlace = await getPlaceDetails({
          placeId: id,
        });

        // If the place does not exist in Google, return a 404.
        if (!googlePlace) {
          return reply.code(404).send();
        }

        let imageUrl: string | null = null;
        if (googlePlace.photos) {
          imageUrl = googlePlace.photos[0] as string;
        }

        const newPlace = await server.prisma.place.create({
          data: {
            address: googlePlace.adrFormatAddress,
            name: googlePlace.displayName?.text || "Unknown",
            lat: `${googlePlace.location?.latitude}`,
            lng: `${googlePlace.location?.longitude}`,
            googleMapsId: googlePlace.id,
            imageUrl,
            phoneNumber: googlePlace.internationalPhoneNumber,
            types: googlePlace.types || [],
            websiteUri: googlePlace.websiteUri,
            createdBy: {
              connect: {
                id: session.userId,
              },
            },
          },
        });

        return reply.code(200).send({
          ...newPlace,
          photos: googlePlace.photos || [],
          lat: parseFloat(newPlace.lat!),
          lng: parseFloat(newPlace.lng!),
        });
      } catch (err) {
        console.log(err);
        request.log.error(`Could not fetch place`, err);
        return reply.code(500).send();
      }
    },
  );

  server.get(
    "/places/search",
    {
      preValidation: verifySession,
      schema: {
        querystring: {
          type: "object",
          properties: {
            query: { type: "string" },
            latitude: { type: "number" },
            longitude: { type: "number" },
            radius: { type: "number" },
          },
          required: ["query", "latitude", "longitude", "radius"],
        },
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                address: { type: "string" },
                lat: { type: "number" },
                lng: { type: "number" },
                name: { type: "string" },
                googleMapsId: { type: "string" },
              },
            },
          },
          404: {
            type: "null",
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { query, latitude, longitude, radius } = request.query as {
        query: string;
        latitude: number;
        longitude: number;
        radius: number;
      };

      try {
        const places = await searchPlaces({
          query,
          center: { latitude, longitude },
          radius,
          fields: [
            "places.id",
            "places.shortFormattedAddress",
            "places.displayName",
            "places.location",
          ],
        });

        return reply.code(200).send(
          places.map((place) => ({
            address: place.shortFormattedAddress,
            lat: place.location?.latitude,
            lng: place.location?.longitude,
            name: place.displayName?.text,
            googleMapsId: place.id,
          })),
        );
      } catch (err) {
        console.log(err);
        request.log.info("Could not fetch places", err);
        return reply.code(500).send();
      }
    },
  );
};

export default PlacesPlugin;
