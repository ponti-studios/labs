import { HttpResponse, http } from "msw";
import { baseURL } from "src/services/api/base";

export const PLACE_ID = "place-id";

export const MOCK_PLACE = {
  id: PLACE_ID,
  itemId: PLACE_ID,
  name: "test place",
  imageUrl: "test-image-url",
  types: ["test_type"],
};

export const PLACE_HANDLERS = [
  http.get(`${baseURL}/places/123`, () => {
    return HttpResponse.json(MOCK_PLACE);
  }),
  http.delete(`${baseURL}/lists/:listId/place/:placeId`, () => {
    return HttpResponse.json({ success: true });
  }),
];
