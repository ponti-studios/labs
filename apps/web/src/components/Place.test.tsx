import { screen } from "@testing-library/react";
import { useParams } from "react-router-dom";
import { type Mock, beforeEach, describe, expect, test } from "vitest";

import { MOCK_PLACE } from "src/test/mocks/place";
import { renderWithProviders } from "src/test/utils";

import Place from "./Place";

describe("Place", () => {
	beforeEach(() => {
		(useParams as Mock).mockReturnValue({ id: MOCK_PLACE.googleMapsId });
	});

	test("should render", async () => {
		renderWithProviders(<Place />);
		expect(await screen.findByText(MOCK_PLACE.name)).toBeInTheDocument();
	});
});
