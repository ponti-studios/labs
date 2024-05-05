import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test } from "vitest";

import {
	TestProviders,
	getMockLists,
	getMockStore,
	getMockUser,
} from "src/test/utils";

import { http, HttpResponse } from "msw";
import { baseURL } from "src/lib/api/base";
import { testServer } from "src/test/test.setup";
import App from "./index";

describe("App", () => {
	test("renders authenticated scenes when user is authenticated", async () => {
		const lists = getMockLists();
		testServer.use(
			http.get(`${baseURL}/me`, () => HttpResponse.json(getMockUser())),
		);
		render(
			<TestProviders store={getMockStore({ isAuth: false })}>
				<App />
			</TestProviders>,
		);

		expect(screen.getByRole("status")).toBeInTheDocument();
		await waitFor(() => {
			expect(screen.getByTestId("authenticated-scenes")).toBeInTheDocument();
		});
	});

	test("renders login page when user is not authenticated", async () => {
		testServer.use(http.get(`${baseURL}/me`, () => HttpResponse.error()));
		render(
			<TestProviders
				initialEntries={["/login"]}
				store={getMockStore({ isAuth: false })}
			>
				<App />
			</TestProviders>,
		);

		expect(screen.getByRole("status")).toBeInTheDocument();
		await waitFor(() => {
			expect(screen.getByTestId("login-page")).toBeInTheDocument();
		});
	});

	test("renders landing page when user API route does not return valid value", async () => {
		testServer.use(
			http.get(`${baseURL}/me`, () => HttpResponse.text("<html></html>")),
		);
		render(
			<TestProviders
				initialEntries={["/login"]}
				store={getMockStore({ isAuth: false })}
			>
				<App />
			</TestProviders>,
		);

		expect(screen.getByRole("status")).toBeInTheDocument();
		await waitFor(() => {
			expect(screen.getByTestId("login-page")).toBeInTheDocument();
		});
	});
});
