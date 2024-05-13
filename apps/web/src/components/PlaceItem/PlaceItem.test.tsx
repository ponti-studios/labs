import { act, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import * as reactRouterDom from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { Mock, MockedFunction } from "vitest";

import { baseURL } from "src/lib/api/base";
import { testServer } from "src/test/test.setup";
import { getMockPlace, renderWithProviders } from "src/test/utils";

import PlaceItem from "./index";

describe("PlaceItem", () => {
	let navigate: MockedFunction<typeof reactRouterDom.useNavigate>;
	const place = getMockPlace();

	beforeEach(() => {
		navigate = vi.fn();
		vi.spyOn(reactRouterDom, "useNavigate").mockReturnValue(navigate);
	});

	test("should render", async () => {
		renderWithProviders(
			<PlaceItem
				place={place}
				onDelete={() => void 0}
				onError={() => void 0}
				listId="123"
			/>,
		);
		const placeItem = await screen.findByTestId("place-item");

		expect(screen.findAllByText("Place Name")).toBeTruthy();

		placeItem.click();
		expect(navigate).toHaveBeenCalledWith(`/places/${place.googleMapsId}`);
	});

	test("should open delete modal", async () => {
		renderWithProviders(
			<PlaceItem
				place={place}
				onDelete={() => void 0}
				onError={() => void 0}
				listId="123"
			/>,
		);
		const deleteButton = await screen.findByTestId("delete-button");

		deleteButton.click();
		expect(screen.findByTestId("delete-modal")).toBeTruthy();
	});

	test("should delete place", async () => {
		testServer.use(
			http.delete(`${baseURL}/lists/123/items/123`, () => {
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const onDelete = vi.fn();
		renderWithProviders(
			<PlaceItem
				place={place}
				onDelete={onDelete}
				onError={() => void 0}
				listId="123"
			/>,
		);
		const deleteButton = await screen.findByTestId("delete-button");

		await act(async () => {
			deleteButton.click();
		});
		const deleteModal = await screen.findByTestId("delete-modal");
		const confirmButton = await screen.findByTestId(
			"delete-place-confirm-button",
		);

		await act(async () => {
			confirmButton.click();
		});

		await waitFor(() => {
			expect(deleteModal).not.toBeInTheDocument();
			expect(onDelete).toHaveBeenCalled();
		});
	});
});
