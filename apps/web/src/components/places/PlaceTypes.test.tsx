import { screen } from "@testing-library/react";
import { renderWithProviders } from "src/test/utils";
import { describe, expect, test } from "vitest";
import PlaceTypes from "./PlaceTypes";

describe("PlaceTypes", () => {
	test("should render types", () => {
		renderWithProviders(<PlaceTypes types={["clothing", "boutique"]} />);
		expect(screen.getByText("clothing")).toBeInTheDocument();
		expect(screen.getByText("boutique")).toBeInTheDocument();
	});

	test("should only render types within limit", () => {
		renderWithProviders(
			<PlaceTypes limit={1} types={["cafe", "restaurant"]} />,
		);
		expect(screen.queryByText("cafe")).toBeInTheDocument();
		expect(screen.queryByText("restaurant")).not.toBeInTheDocument();
	});

	test("should not render store for multi-types", () => {
		renderWithProviders(<PlaceTypes types={["store", "restaurant"]} />);
		expect(screen.queryByText("store")).not.toBeInTheDocument();
		expect(screen.queryByText("restaurant")).toBeInTheDocument();
	});
});
