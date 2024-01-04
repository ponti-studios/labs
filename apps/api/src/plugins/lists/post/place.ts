import { FastifyInstance } from "fastify";
import { verifySession } from "../../auth";
import { EVENTS, track } from "../../../analytics";

const postListsPlace = (server: FastifyInstance) => {
  // A route to create a new Place and add it to a list
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
              properties: {
                name: { type: "string" },
                address: { type: "string" },
                location: {
                  type: "object",
                  properties: {
                    lat: { type: "number" },
                    lng: { type: "number" },
                  },
                  required: ["lat", "lng"],
                },
              },
              required: ["name", "address", "location"],
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
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  description: { type: "string" },
                  address: { type: "string" },
                  googleMapsId: { type: "string" },
                  types: { type: "array", items: { type: "string" } },
                  lat: { type: "string" },
                  lng: { type: "string" },
                  createdAt: { type: "string" },
                  updatedAt: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    async (request) => {
      const { prisma } = server;
      const { userId } = request.session.get("data");
      const { listIds, place } = request.body as {
        listIds: string[];
        place: {
          name: string;
          address: string;
          place_id: string;
          location: { lat: number; lng: number };
          types: string[];
        };
      };
      const { name, address, location, place_id } = place;
      const filteredListTypes = place.types.filter((type) => {
        return !/point_of_interest|establishment/.test(type);
      });

      const createdPlace = await prisma.place.create({
        data: {
          name,
          description: "",
          address,
          googleMapsId: place_id,
          types: filteredListTypes,
          lat: `${location.lat}`,
          lng: `${location.lng}`,
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
};

export default postListsPlace;
