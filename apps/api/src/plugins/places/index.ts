import {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest,
} from "fastify";

import { EVENTS, track } from "../../analytics";
import { SessionToken } from "../../typings";
import { verifySession } from "../auth";
import {
  getPlaceDetails,
  getPlacePhotos,
  searchPlaces,
} from "../google/places";

const types = {
  location: {
    latitude: { type: "number" },
    longitude: { type: "number" },
  },
};

type Location = {
  latitude: number;
  longitude: number;
};

type PlacePostBody = {
  listIds: string[];
  place: Location & {
    name: string;
    address: string;
    imageUrl: string;
    googleMapsId: string;
    types: string[];
    websiteUri: string;
  };
};

const CreatePlaceProperties = {
  ...types.location,
  name: { type: "string" },
  address: { type: "string" },
  googleMapsId: { type: "string" },
  websiteUri: { type: "string" },
  imageUrl: { type: "string" },
  types: { type: "array", items: { type: "string" } },
};

const CreatePlaceRequired = Object.keys(CreatePlaceProperties);

const CreatePlaceResponseProperties = {
  ...CreatePlaceProperties,
  id: { type: "string" },
  description: { type: "string" },
  createdAt: { type: "string" },
  updatedAt: { type: "string" },
};
const CreatePlaceResponseRequired = Object.keys(CreatePlaceResponseProperties);

const PlacesPlugin: FastifyPluginAsync = async (server: FastifyInstance) => {
  server.post(
    "/lists/place",
    {
      preValidation: verifySession,
      schema: {
        body: {
          type: "object",
          properties: {
            listIds: {
              type: "array",
              items: { type: "string" },
            },
            place: {
              type: "object",
              properties: CreatePlaceProperties,
              required: CreatePlaceRequired,
            },
          },
          required: ["listIds", "place"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              lists: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    createdAt: { type: "string" },
                    updatedAt: { type: "string" },
                  },
                },
              },
              place: {
                type: "object",
                properties: CreatePlaceResponseProperties,
                required: CreatePlaceResponseRequired,
              },
            },
          },
        },
      },
    },
    async (request) => {
      const { prisma } = server;
      const { userId } = request.session.get("data");
      const { listIds, place } = request.body as PlacePostBody;
      const filteredListTypes = place.types.filter((type) => {
        return !/point_of_interest|establishment|political/.test(type);
      });

      const createdPlace = await prisma.place.create({
        data: {
          name: place.name,
          description: "",
          address: place.address,
          googleMapsId: place.googleMapsId,
          types: filteredListTypes,
          imageUrl: place.imageUrl,
          latitude: place.latitude,
          longitude: place.longitude,
          websiteUri: place.websiteUri,
          createdBy: {
            connect: {
              id: userId,
            },
          },
        },
      });

      await prisma.item.createMany({
        data: [...listIds].map((id) => ({
          type: "PLACE",
          itemId: createdPlace.id,
          listId: id,
        })),
        skipDuplicates: true,
      });

      const lists = await prisma.list.findMany({
        where: { id: { in: listIds } },
      });

      // 👇 Track place creation
      track(userId, EVENTS.USER_EVENTS.PLACE_ADDED, {
        types: place.types,
      });

      server.log.info("place added to lists", {
        userId,
        placeId: createdPlace.id,
        listIds,
      });

      return { place: createdPlace, lists };
    },
  );

  server.delete(
    "/lists/:listId/place/:placeId",
    {
      preValidation: verifySession,
      schema: {
        params: {
          type: "object",
          properties: {
            listId: { type: "string" },
            placeId: { type: "string" },
          },
          required: ["listId", "placeId"],
        },
      },
    },
    async (request) => {
      const { listId, placeId } = request.params as {
        listId: string;
        placeId: string;
      };
      const { prisma } = server;
      const { userId } = request.session.get("data");

      await prisma.item.deleteMany({
        where: {
          listId,
          itemId: placeId,
        },
      });

      server.log.info("place removed from list", {
        userId,
        placeId,
        listId,
      });

      return { success: true };
    },
  );

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
              name: { type: "string" },
              googleMapsId: { type: "string" },
              imageUrl: { type: "string" },
              phoneNumber: { type: "string" },
              photos: { type: "array", items: { type: "string" } },
              types: { type: "array", items: { type: "string" } },
              websiteUri: { type: "string" },
              ...types.location,
            },
            required: [
              "address",
              "latitude",
              "longitude",
              "name",
              "googleMapsId",
              "imageUrl",
              "phoneNumber",
              "photos",
              "types",
              "websiteUri",
            ],
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

        const newPlace = await server.prisma.place.create({
          data: {
            ...googlePlace,
            imageUrl: googlePlace.photos?.[0].imageUrl || "",
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
        });
      } catch (err) {
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
            radius: { type: "number" },
            ...types.location,
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
                name: { type: "string" },
                googleMapsId: { type: "string" },
                ...types.location,
              },
              required: [
                "address",
                "latitude",
                "longitude",
                "name",
                "googleMapsId",
              ],
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
            latitude: place.location?.latitude,
            longitude: place.location?.longitude,
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
