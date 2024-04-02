import { screen } from "@testing-library/react";
import { renderWithProviders } from "src/test/utils";
import { describe, expect, test } from "vitest";

import Home from ".";

describe("Home", () => {
	test("renders", () => {
		renderWithProviders(<Home />);
		expect(screen.getByText("Make the world yours.")).toBeInTheDocument();
	});
});
