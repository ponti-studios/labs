import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import "./utils";

import { baseURL } from "../lib/api/base";
import { MOCK_PLACE, PLACE_HANDLERS } from "./mocks/place";

export const TEST_LIST_ID = "list-id";

vi.mock("react-router-dom", async (importOriginal) => {
	const actual = await importOriginal();
	return {
		...(actual as any),
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
