import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "src/test/utils";
import { describe, expect, test } from "vitest";

import Layout from "src/layout";
import LandingPage from "src/scenes";

describe("landing", () => {
	test("renders", () => {
		renderWithProviders(<LandingPage />);
		expect(screen.getByText("Make the world yours.")).toBeInTheDocument();
	});
	test("should render log in button if user is not logged in", () => {
		renderWithProviders(<Layout />);
		expect(screen.getByText("Log In")).toBeInTheDocument();
	});
	test("should render auth nav menu if user is logged in", async () => {
		renderWithProviders(<Layout />, { isAuth: true });

		await waitFor(() => {
			expect(screen.getByTestId("auth-dropdown-button")).toBeInTheDocument();
		});
	});
});
