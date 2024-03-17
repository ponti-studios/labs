import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { createSlice } from "@reduxjs/toolkit";
import React, { PropsWithChildren } from "react";
import { useParams } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { Mock, afterAll, afterEach, beforeAll, vi } from "vitest";

import { api, baseURL } from "../services/api/base";
import { MOCK_PLACE, PLACE_HANDLERS } from "./mocks/place";

export const TEST_LIST_ID = "list-id";

vi.mock("src/services/places", () => ({
  usePlacesService: () => ({
    getDetails: vi.fn(),
  }),
  usePlaceModal: vi.fn(() => ({
    closePlaceModal: vi.fn(),
    openPlaceModal: vi.fn(),
  })),
  placesSlice: createSlice({
    name: "places",
    initialState: {
      isOpen: false,
      listId: null,
      place: null,
      onClose: null,
    },
    reducers: {
      openPlaceModal: vi.fn(),
      closePlaceModal: vi.fn(),
    },
  }),
}));

vi.mock("react-router-dom", () => ({
  useParams: vi.fn(),
  useNavigate: vi.fn(),
  Link: (props: PropsWithChildren<object>) => {
    return <a {...props}>{props.children}</a>;
  },
}));

const restHandlers = [
  http.get(`${baseURL}/lists/${TEST_LIST_ID}`, () => {
    return HttpResponse.json({
      id: TEST_LIST_ID,
      name: "test list",
      items: [MOCK_PLACE],
    });
  }),
  ...PLACE_HANDLERS,
];

const server = setupServer(...restHandlers);

// Start server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
  vi.spyOn(api, "get");
  vi.spyOn(api, "delete");
  vi.spyOn(api, "post");
  vi.spyOn(api, "put");
});

//  Close server after all tests
afterAll(() => server.close());

// Reset handlers after each test `important for test isolation`
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

beforeAll(() => {
  (useParams as Mock).mockReturnValue({ id: "123" });
});
