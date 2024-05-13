import { screen, waitFor } from "@testing-library/react";
import * as googleMaps from "@vis.gl/react-google-maps";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { baseURL } from "src/lib/api/base";
import { Component as Dashboard } from "src/scenes/dashboard";
import { testServer } from "src/test/test.setup";
import { getMockLists, renderWithProviders } from "src/test/utils";

describe("Dashboard", () => {
	beforeEach(() => {
		testServer.use(
			http.get(`${baseURL}/lists`, () => HttpResponse.json(getMockLists())),
		);
	});

	test("renders the loading spinner when map is not loaded", async () => {
		vi.spyOn(googleMaps, "useApiLoadingStatus").mockReturnValue(
			googleMaps.APILoadingStatus.LOADING,
		);
		renderWithProviders(<Dashboard />, { isAuth: true });

		await waitFor(() => {
			expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
		});
	});

	test("renders the places autocomplete and RoccoMap when map is loaded", async () => {
		vi.spyOn(googleMaps, "useApiLoadingStatus").mockReturnValue(
			googleMaps.APILoadingStatus.LOADED,
		);
		renderWithProviders(<Dashboard />, { isAuth: true });
		await waitFor(() => {
			expect(screen.getByTestId("places-autocomplete")).toBeInTheDocument();
			expect(screen.getByTestId("rocco-map")).toBeInTheDocument();
		});
	});

	test("renders lists", async () => {
		const lists = getMockLists();
		vi.spyOn(googleMaps, "useApiLoadingStatus").mockReturnValue(
			googleMaps.APILoadingStatus.LOADED,
		);
		renderWithProviders(<Dashboard />, { isAuth: true });

		await waitFor(() => {
			expect(screen.getByTestId("lists")).toBeInTheDocument();
			expect(screen.getByText(lists[0].name)).toBeInTheDocument();
			expect(screen.getByText(lists[1].name)).toBeInTheDocument();
		});
	});
});
