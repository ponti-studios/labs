import { http, HttpResponse } from "msw";
import { createElement } from "react";
import { vi } from "vitest";

import { baseURL } from "src/lib/api/base";

vi.mock("@vis.gl/react-google-maps", async (importOriginal) => {
	const actual = await importOriginal();
	return {
		...(actual as any),
		useApiIsLoaded: () => true,
		useApiLoadingStatus: vi.fn(),
		Map: () => createElement("div", { "data-testid": "google-map" }),
	};
});

export const PLACE_ID = "place-id";

export const MOCK_PLACE = {
	id: PLACE_ID,
	itemId: PLACE_ID,
	googleMapsId: "123",
	name: "test place",
	imageUrl: "test-image-url",
	types: ["test_type"],
};

export const MOCK_PLACE_SEARCH = [
	{
		googleMapsId: "place-id",
		name: "New York",
		latitude: 456,
		longitude: 678,
	},
];

export const AUTH_HANDLERS = [
	http.get(`${baseURL}/me`, () => {
		return HttpResponse.json({
			email: "test@test.com",
			id: "test-id",
		});
	}),
];

export const PLACE_HANDLERS = [
	http.get(`${baseURL}/places/123`, () => {
		return HttpResponse.json(MOCK_PLACE);
	}),
	http.delete(`${baseURL}/lists/:listId/place/:placeId`, () => {
		return HttpResponse.json({ success: true });
	}),
	http.get(`${baseURL}/places/search`, () => {
		return HttpResponse.json(MOCK_PLACE_SEARCH);
	}),
];
