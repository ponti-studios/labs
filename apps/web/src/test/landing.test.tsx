import { screen } from "@testing-library/react";
import { renderWithProviders } from "src/test/utils";
import { describe, expect, test } from "vitest";

import LandingPage from "../scenes";

describe("landing", () => {
	test("renders", () => {
		renderWithProviders(<LandingPage />);
		expect(screen.getByText("Make the world yours.")).toBeInTheDocument();
	});
});
