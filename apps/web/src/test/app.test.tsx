import { render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { type Mock, describe, expect, test } from "vitest";

import { baseURL } from "src/lib/api/base";
import { useAuth } from "src/lib/auth";
import { testServer } from "src/test/test.setup";
import {
	TestProviders,
	getMockUser,
	renderWithProviders,
	useAuthMock,
} from "src/test/utils";
import App from "../layout";

describe("App", () => {
	test("renders authenticated scenes when user is authenticated", async () => {
		testServer.use(
			http.get(`${baseURL}/me`, () => HttpResponse.json(getMockUser())),
		);

		(useAuth as Mock).mockReturnValue(useAuthMock({ isAuth: true }));
		renderWithProviders(<App />);

		await waitFor(() => {
			expect(screen.getByTestId("authenticated-scenes")).toBeInTheDocument();
		});
	});

	test("renders login page when user is not authenticated", async () => {
		testServer.use(http.get(`${baseURL}/me`, () => HttpResponse.error()));
		(useAuth as Mock).mockReturnValue(useAuthMock({ isAuth: false }));
		render(
			<TestProviders initialEntries={["/login"]}>
				<App />
			</TestProviders>,
		);

		await waitFor(() => {
			expect(screen.getByTestId("login-page")).toBeInTheDocument();
		});
	});

	test("renders landing page when user API route does not return valid value", async () => {
		testServer.use(
			http.get(`${baseURL}/me`, () => HttpResponse.text("<html></html>")),
		);
		(useAuth as Mock).mockReturnValue(useAuthMock({ isAuth: false }));
		render(
			<TestProviders initialEntries={["/login"]}>
				<App />
			</TestProviders>,
		);

		await waitFor(() => {
			expect(screen.getByTestId("login-page")).toBeInTheDocument();
		});
	});
});
