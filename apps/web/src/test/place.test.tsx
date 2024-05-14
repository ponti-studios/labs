import { screen, waitFor } from "@testing-library/react";
import * as reactRouterDom from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { Component as Place } from "src/scenes/place";
import { MOCK_PLACE } from "src/test/mocks/place";
import { renderWithProviders } from "src/test/utils";

describe("Place", () => {
	const navigate = vi.fn();

	beforeEach(() => {
		vi.spyOn(reactRouterDom, "useParams").mockReturnValue({
			id: MOCK_PLACE.googleMapsId,
		});
		vi.spyOn(reactRouterDom, "useNavigate").mockReturnValue(navigate);
	});

	test("should redirect to login if user is not authenticated", async () => {
		renderWithProviders(<Place />, { isAuth: false });

		await waitFor(() => {
			expect(navigate).toHaveBeenCalledWith("/login");
		});
	});

	test("should render place", async () => {
		renderWithProviders(<Place />, { isAuth: true });

		await waitFor(() => {
			expect(screen.queryByText(MOCK_PLACE.name)).toBeInTheDocument();
		});
	});
});
