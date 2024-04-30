import { http, HttpResponse } from "msw";
import { createElement } from "react";
import { baseURL } from "src/services/api/base";
import { vi } from "vitest";

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

vi.mock("@vis.gl/react-google-maps", () => ({
	useApiIsLoaded: () => true,
	Map: () => createElement("div", { "data-testid": "google-map" }),
}));
