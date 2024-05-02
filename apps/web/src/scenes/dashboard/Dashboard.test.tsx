import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import * as reactRouterDom from "react-router-dom";
import { type Mock, beforeEach, describe, expect, test, vi } from "vitest";

import { baseURL } from "src/services/api/base";
import { MOCK_PLACE_SEARCH } from "src/test/mocks/place";
import { testServer } from "src/test/test.setup";
import {
	TestProviders,
	getMockLists,
	getMockStore,
	renderWithProviders,
} from "src/test/utils";
import Dashboard from "./Dashboard";

const { useNavigate } = reactRouterDom;

describe("Dashboard", () => {
	beforeEach(() => {
		testServer.use(
			http.get(`${baseURL}/lists`, () => HttpResponse.json(getMockLists())),
		);
	});

	test("renders the loading spinner when map is not loaded", () => {
		renderWithProviders(<Dashboard isMapLoaded={false} />);
		expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
	});

	test("renders the places autocomplete and RoccoMap when map is loaded", () => {
		renderWithProviders(<Dashboard isMapLoaded={true} />);
		expect(screen.getByTestId("places-autocomplete")).toBeInTheDocument();
		expect(screen.getByTestId("rocco-map")).toBeInTheDocument();
	});

	test("renders lists", async () => {
		const lists = getMockLists();
		renderWithProviders(<Dashboard isMapLoaded={true} />);

		await waitFor(() => {
			expect(screen.getByTestId("lists")).toBeInTheDocument();
			expect(screen.getByText(lists[0].name)).toBeInTheDocument();
			expect(screen.getByText(lists[1].name)).toBeInTheDocument();
		});
	});
});
