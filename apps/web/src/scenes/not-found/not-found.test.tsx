import { screen } from "@testing-library/react";
import { useLocation, useMatch } from "react-router-dom";
import type { Mock } from "vitest";

import { renderWithProviders } from "src/test/utils";

import NotFound from ".";

describe("not-found", () => {
	it("should render not found for invites route", () => {
		(useLocation as Mock).mockReturnValue({ pathname: "/invites/:id" });
		renderWithProviders(<NotFound />);

		expect(
			screen.getByText("This invite could not be found."),
		).toBeInTheDocument();
	});

	it("should render not found for list route", () => {
		(useLocation as Mock).mockReturnValue({ pathname: "/" });
		(useMatch as Mock).mockImplementation((path) => {
			if (path === "/list/:id") {
				return true;
			}
			return false;
		});

		renderWithProviders(<NotFound />);

		expect(screen.getByText("This list could not be found.")).toBeInTheDocument();
	});
});
