import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import * as reactRouterDom from "react-router-dom";
import {
	type Mock,
	type MockedFunction,
	beforeAll,
	beforeEach,
	describe,
	expect,
	test,
	vi,
} from "vitest";

import api from "src/lib/api";
import { baseURL } from "src/lib/api/base";
import { Component as List } from "src/scenes/lists/list";
import { MOCK_PLACE, PLACE_ID } from "src/test/mocks/place";
import { TEST_LIST_ID, testServer } from "src/test/test.setup";
import { renderWithProviders } from "src/test/utils";

describe("List", () => {
	const navigate = vi.fn();

	beforeEach(() => {
		vi.spyOn(api, "delete").mockImplementation(() => Promise.resolve());
		vi.spyOn(reactRouterDom, "useParams").mockReturnValue({ id: TEST_LIST_ID });
		vi.spyOn(reactRouterDom, "useNavigate").mockReturnValue(navigate);
	});

	describe("when list does not belong to user", () => {
		beforeEach(() => {
			testServer.use(
				http.get(`${baseURL}/lists/${TEST_LIST_ID}`, () => {
					return HttpResponse.json({
						id: TEST_LIST_ID,
						name: "test list",
						items: [MOCK_PLACE],
						userId: "other-user-id",
					});
				}),
			);
		});

		test("should navigate to home page", async () => {
			renderWithProviders(<List />, { isAuth: true });

			await waitFor(() => {
				expect(screen.queryByText("test list")).toBeInTheDocument();
			});
		});
	});

	describe("own list", () => {
		beforeEach(() => {
			const userId = "user-id";
			testServer.use(
				http.get(`${baseURL}/lists/${TEST_LIST_ID}`, () => {
					return HttpResponse.json({
						id: TEST_LIST_ID,
						name: "test list",
						items: [MOCK_PLACE],
						userId,
					});
				}),
			);
		});

		test("should hide add-to-list by default", async () => {
			renderWithProviders(<List />, { isAuth: true });

			await waitFor(() => {
				expect(screen.queryByTestId("add-to-list")).not.toBeInTheDocument();
			});
		});

		test("should show add-to-list when add-to-list-button is clicked", async () => {
			const user = userEvent.setup();
			renderWithProviders(<List />, { isAuth: true });

			await waitFor(() => {
				expect(
					screen.queryByTestId("add-to-list-form"),
				).not.toBeInTheDocument();
				expect(screen.queryByTestId("add-to-list-button")).toBeInTheDocument();
			});

			await user.click(screen.getByTestId("add-to-list-button"));

			await waitFor(() => {
				expect(screen.queryByTestId("add-to-list")).toBeInTheDocument();
			});
		});

		test("should display add-to-list when data is empty", async () => {
			testServer.use(
				http.get(`${baseURL}/lists/${TEST_LIST_ID}`, () => {
					return HttpResponse.json({
						id: TEST_LIST_ID,
						name: "test list",
						items: [],
						userId: "user-id",
					});
				}),
			);

			renderWithProviders(<List />, { isAuth: true });

			await waitFor(() => {
				expect(screen.queryByTestId("add-to-list")).toBeInTheDocument();
			});
		});
	});
});
