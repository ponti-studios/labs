import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import * as reactRouterDom from "react-router-dom";
import {
	type Mock,
	SpyInstance,
	beforeEach,
	describe,
	expect,
	test,
	vi,
} from "vitest";

import { baseURL } from "src/services/api/base";
import { MOCK_PLACE_SEARCH } from "src/test/mocks/place";
import { testServer } from "src/test/test.setup";
import {
	TestProviders,
	getMockLists,
	getMockStore,
	renderWithProviders,
} from "src/test/utils";
import Dashboard, { ZOOM_LEVELS } from "./Dashboard";

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

	async function selectAutocompleteOption() {
		userEvent.type(screen.getByTestId("places-autocomplete-input"), "New York");

		return waitFor(() => {
			expect(
				screen.getByTestId("places-autocomplete-option"),
			).toBeInTheDocument();
		});
	}

	test.skip("navigates to the place details page when a place is selected from the autocomplete", async () => {
		const navigateMock = vi.fn();
		vi.spyOn(reactRouterDom, "generatePath").mockReturnValue("/place/place-id");
		(useNavigate as Mock).mockReturnValue(navigateMock);

		const store = getMockStore({
			isAuth: true,
			authOptions: {
				currentLocation: {
					latitude: 123,
					longitude: 456,
				},
			},
		});

		render(
			<TestProviders store={store}>
				<Dashboard isMapLoaded={true} />
			</TestProviders>,
		);

		await selectAutocompleteOption();

		userEvent.click(screen.getByTestId("places-autocomplete-option"));
		expect(store.getState().auth).toEqual("/place/place-id");
	});

	test.skip("updates the center and zoom level when a place is selected", async () => {
		const store = getMockStore({
			isAuth: true,
			authOptions: {
				currentLocation: {
					latitude: 123,
					longitude: 456,
				},
			},
		});
		render(
			<TestProviders store={store}>
				<Dashboard isMapLoaded={true} />
			</TestProviders>,
		);
		await selectAutocompleteOption();

		userEvent.click(screen.getByTestId("places-autocomplete-option"));

		await waitFor(() => {
			expect(screen.getByTestId("rocco-map")).toHaveAttribute(
				"data-center",
				JSON.stringify({
					latitude: MOCK_PLACE_SEARCH[0].latitude,
					longitude: MOCK_PLACE_SEARCH[0].longitude,
				}),
			);
			expect(screen.getByTestId("rocco-map")).toHaveAttribute(
				"data-zoom",
				`${ZOOM_LEVELS.SELECTED}`,
			);
		});
	});

	test("renders authenticated scenes when user is authenticated", async () => {
		const lists = getMockLists();
		renderWithProviders(<Dashboard isMapLoaded={true} />);

		await waitFor(() => {
			expect(screen.getByTestId("lists")).toBeInTheDocument();
			expect(screen.getByText(lists[0].name)).toBeInTheDocument();
			expect(screen.getByText(lists[1].name)).toBeInTheDocument();
		});
	});
});
