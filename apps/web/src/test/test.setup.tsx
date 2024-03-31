import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import React, { PropsWithChildren } from "react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, vi } from "vitest";

import { baseURL } from "../services/api/base";
import { MOCK_PLACE, PLACE_HANDLERS } from "./mocks/place";

export const TEST_LIST_ID = "list-id";

vi.mock("src/services/store", async () => {
  const actual = (await vi.importActual("src/services/store")) as any; // eslint-disable-line
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

vi.mock("react-router-dom", async () => {
  const actual = (await vi.importActual("react-router-dom")) as any; // eslint-disable-line
  return {
    ...actual,
    useParams: vi.fn(),
    useMatch: vi.fn(),
    useLocation: vi.fn(() => ({ pathname: "/" })),
    useNavigate: vi.fn(() => vi.fn()),
    Link: (props: PropsWithChildren<object>) => {
      return <a {...props}>{props.children}</a>;
    },
  };
});

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

export const testServer = setupServer(...restHandlers);

// Start server before all tests
beforeAll(() => {
  testServer.listen({ onUnhandledRequest: "error" });
});

//  Close server after all tests
afterAll(() => testServer.close());

// Reset handlers after each test `important for test isolation`
afterEach(() => {
  testServer.resetHandlers();
  vi.resetAllMocks();
  cleanup();
});
