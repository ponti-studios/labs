import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "src/test/utils";
import { describe, expect, test } from "vitest";

import Layout from "src/layout";
import LandingPage from "src/scenes";

describe("landing", () => {
	test("renders", () => {
		renderWithProviders(<LandingPage />);
		expect(screen.queryByText("Make the world yours.")).toBeInTheDocument();
	});
	test("should render log in button if user is not logged in", () => {
		renderWithProviders(<Layout />);
		expect(screen.queryByTestId("header-login-button")).toBeInTheDocument();
	});
	test("should render auth nav menu if user is logged in", async () => {
		renderWithProviders(<Layout />, { isAuth: true });

		await waitFor(() => {
			expect(screen.queryByTestId("auth-dropdown-button")).toBeInTheDocument();
		});
	});
});
