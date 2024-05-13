import { screen } from "@testing-library/react";
import * as reactRouterDom from "react-router-dom";
import { describe, expect, test, vi } from "vitest";

import NotFound from "src/scenes/not-found";
import { renderWithProviders } from "src/test/utils";

function mockUseMatch(paths: { [key: string]: boolean }) {
	vi.spyOn(reactRouterDom, "useMatch").mockImplementation((path) => {
		return (paths[path as any] ?? false) as any;
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
