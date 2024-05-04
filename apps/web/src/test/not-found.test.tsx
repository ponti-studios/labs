import { screen } from "@testing-library/react";
import { useMatch } from "react-router-dom";
import { type Mock, describe, expect, test } from "vitest";

import { renderWithProviders } from "src/test/utils";

import NotFound from "../scenes/not-found";

function mockUseMatch(paths: { [key: string]: boolean }) {
	(useMatch as Mock).mockImplementation((path) => {
		return paths[path] ?? false;
	});
}
describe("not-found", () => {
	test("should render not found for invites route", () => {
		mockUseMatch({ "/invites": true });
		renderWithProviders(<NotFound />);

		expect(
			screen.getByText("Sign up to start making lists with friends!"),
		).toBeInTheDocument();
	});

	test("should render NotFound for invite route", () => {
		mockUseMatch({ "/invites/:id": true });
		renderWithProviders(<NotFound />);

		expect(
			screen.getByText("This invite could not be found."),
		).toBeInTheDocument();
	});

	test("should render not found for list route", () => {
		mockUseMatch({ "/list/:id": true });
		renderWithProviders(<NotFound />);

		expect(
			screen.getByText("This list could not be found."),
		).toBeInTheDocument();
	});
});
