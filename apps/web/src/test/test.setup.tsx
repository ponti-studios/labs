import "@testing-library/jest-dom";

import React from "react";
import { useParams } from "react-router-dom";
import { Mock, afterAll, afterEach, beforeAll, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { cleanup } from "@testing-library/react";

import { api, baseURL } from "../services/api/base";
import { PropsWithChildren } from "react";

const listId = "list-id";
const placeId = "place-id";

vi.mock("react-router-dom", () => ({
  useParams: vi.fn(),
  useNavigate: vi.fn(),
  Link: (props: PropsWithChildren<object>) => {
    return <a {...props}>{props.children}</a>;
  },
}));

const restHandlers = [
  http.get(`${baseURL}/lists/${listId}`, () => {
    return HttpResponse.json({
      id: listId,
      name: "test list",
      items: [
        {
          id: placeId,
          itemId: placeId,
          name: "test place",
          types: ["test_type"],
        },
      ],
    });
  }),
  http.delete(`${baseURL}/lists/${listId}/place/${placeId}`, () => {
    return HttpResponse.json({ success: true });
  }),
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
