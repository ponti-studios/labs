import { act, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { useNavigate } from "react-router-dom";
import { type MockedFunction, vi } from "vitest";
import type { Mock } from "vitest";

import { baseURL } from "src/services/api/base";
import type { ListPlace } from "src/services/types";
import { testServer } from "src/test/test.setup";
import { renderWithProviders } from "src/test/utils";

import PlaceItem from "./index";

describe("PlaceItem", () => {
	let navigate: MockedFunction<typeof useNavigate>;
	const place: ListPlace = {
		imageUrl: "https://example.com/image.jpg",
		googleMapsId: "123",
		name: "Place Name",
		types: ["type1", "type2"],
		id: "123",
		itemId: "123",
		description: "Description",
	};

	beforeEach(() => {
		navigate = vi.fn();
		(useNavigate as Mock).mockReturnValue(navigate);
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
