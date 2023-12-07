import { FastifyInstance } from "fastify";
import { verifySession } from "../../auth";

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
      const { name, address, location, place_id, types } = place;

      const createdPlace = await prisma.place.create({
        data: {
          name,
          description: "",
          address,
          googleMapsId: place_id,
          types,
          lat: `${location.lat}`,
          lng: `${location.lng}`,
          createdBy: {
            connect: {
              id: request.session.get("data").userId,
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

      return { place: createdPlace, lists };
    },
  );
};

export default postListsPlace;
