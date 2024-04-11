import { prisma } from "@hominem/db";
import type { FastifyInstance } from "fastify";
import { vi } from "vitest";

import { createServer } from "@app/server";
import { MOCKS } from "@test/mocks";
import { googlePlaces } from "@test/test.setup";
import { mockAuthSession } from "@test/utils";

import * as googlePlacesPlugin from "../google/places";

const { PLACE, GOOGLE_PLACE_GET, GOOGLE_PHOTO_MEDIA } = MOCKS;

describe("/places/:id", () => {
	let server: FastifyInstance;

	beforeAll(async () => {
		vi.spyOn(googlePlacesPlugin, "getPlaceDetails");
		server = await createServer({ logger: false });
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	afterAll(async () => {
		await server.close();
	});

	describe("authenticated", () => {
		beforeEach(() => {
			mockAuthSession();
		});

		test("should return place from Google Places if place does not exist in DB", async () => {
			vi.spyOn(prisma.place, "findFirst").mockResolvedValue(null);
			googlePlaces.get.mockResolvedValue(GOOGLE_PLACE_GET);
			googlePlaces.photos.getMedia.mockResolvedValue(GOOGLE_PHOTO_MEDIA);
			const response = await server.inject({
				method: "GET",
				url: "/places/123",
			});

			expect(prisma.place.findFirst).toHaveBeenCalledWith({
				where: { googleMapsId: "123" },
			});
			expect(googlePlacesPlugin.getPlaceDetails).toHaveBeenCalled();
			expect(googlePlaces.get).toHaveBeenCalledWith({
				name: "places/123",
				fields:
					"adrFormatAddress,displayName,location,id,internationalPhoneNumber,types,websiteUri,photos",
			});
			expect(response.statusCode).toEqual(200);
			expect(response.json()).toMatchObject(PLACE);
		});

		test("should return place from DB if place exists in DB", async () => {
			vi.spyOn(prisma.place, "findFirst").mockResolvedValue(PLACE);
			const response = await server.inject({
				method: "GET",
				url: "/places/123",
			});

			expect(prisma.place.findFirst).toHaveBeenCalledWith({
				where: { googleMapsId: "123" },
			});
			expect(googlePlacesPlugin.getPlaceDetails).not.toHaveBeenCalled();
			expect(response.statusCode).toEqual(200);
			expect(response.json()).toMatchObject(PLACE);
		});
	});
});
