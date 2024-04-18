import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { useNavigate, useParams } from "react-router-dom";
import {
	type Mock,
	beforeAll,
	beforeEach,
	describe,
	expect,
	test,
	vi,
} from "vitest";

import api from "src/services/api";
import { baseURL } from "src/services/api/base";
import { useAuth } from "src/services/hooks";
import { MOCK_PLACE, PLACE_ID } from "src/test/mocks/place";
import { TEST_LIST_ID, testServer } from "src/test/test.setup";
import { renderWithProviders } from "src/test/utils";

import List from ".";

describe("List", () => {
	beforeEach(() => {
		vi.spyOn(api, "delete").mockImplementation(() => Promise.resolve());
		(useParams as Mock).mockReturnValue({ id: TEST_LIST_ID });
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
			(useAuth as Mock).mockReturnValue({ user: null });
		});

		test("should navigate to home page", async () => {
			const navigate = vi.fn();
			(useNavigate as Mock).mockReturnValue(navigate);
			renderWithProviders(<List />, { isAuth: true });

			await waitFor(() => {
				expect(navigate).toHaveBeenCalledWith("/");
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
			(useAuth as Mock).mockReturnValue({ user: { id: userId } });
		});

		test("should hide add-to-list by default", async () => {
			renderWithProviders(<List />, { isAuth: true });

			await waitFor(() => {
				expect(screen.queryByTestId("add-to-list")).not.toBeInTheDocument();
			});
		});

		test("should show add-to-list when add-to-list-button is clicked", async () => {
			renderWithProviders(<List />, { isAuth: true });

			await waitFor(() => {
				expect(screen.queryByTestId("add-to-list")).not.toBeInTheDocument();
			});

			await act(async () => {
				fireEvent.click(screen.getByTestId("add-to-list-button"));
			});

			await waitFor(() => {
				expect(screen.queryByTestId("add-to-list")).toBeInTheDocument();
			});
		});

		test("should display Add a place when data is empty", async () => {
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
				expect(screen.getByText("Add a place")).toBeInTheDocument();
				expect(
					screen.getByText(
						"This list is empty. Start adding places with the search bar above.",
					),
				).toBeInTheDocument();
			});
		});

		describe("delete list item", () => {
			beforeAll(() => {
				testServer.use(
					http.delete(
						`${baseURL}/lists/${TEST_LIST_ID}/items/${PLACE_ID}`,
						() => {
							return new HttpResponse(null, { status: 204 });
						},
					),
				);
			});

			test("should make DELETE API request on enter click", async () => {
				renderWithProviders(<List />, { isAuth: true });

				// Wait for list to load
				await waitFor(() => {
					expect(screen.getByTestId("delete-button")).toBeInTheDocument();
				});

				const deleteButton = await screen.getByTestId("delete-button");

				await act(async () => {
					fireEvent.keyDown(deleteButton, { key: "Enter", code: "Enter" });
				});

				const confirmButton = await screen.findByTestId(
					"delete-place-confirm-button",
				);

				confirmButton.click();

				await waitFor(() => {
					expect(api.delete).toHaveBeenCalledWith(
						"/lists/list-id/items/place-id",
					);
				});
			});

			test("should not make DELETE API request on non-enter click", async () => {
				renderWithProviders(<List />, { isAuth: true });

				// Wait for list to load
				await waitFor(() => {
					expect(screen.getByTestId("delete-button")).toBeInTheDocument();
				});

				const deleteButton = await screen.getByTestId("delete-button");

				await act(async () => {
					fireEvent.keyDown(deleteButton, { key: "Space", code: "Space" });
				});

				await waitFor(() => {
					expect(api.delete).not.toHaveBeenCalled();
				});
			});

			test("should make DELETE API request on button click", async () => {
				renderWithProviders(<List />, { isAuth: true });

				// Wait for list to load
				await waitFor(() => {
					expect(screen.getByTestId("delete-button")).toBeInTheDocument();
				});

				const deleteButton = screen.getByTestId("delete-button");

				await act(async () => {
					fireEvent.click(deleteButton);
				});

				const confirmButton = await screen.findByTestId(
					"delete-place-confirm-button",
				);

				confirmButton.click();

				await waitFor(() => {
					expect(api.delete).toHaveBeenCalledWith(
						"/lists/list-id/items/place-id",
					);
				});
			});

			test("should handle api error", async () => {
				(api.delete as Mock).mockRejectedValue("error");
				testServer.use(
					http.delete(
						`${baseURL}/lists/${TEST_LIST_ID}/items/${PLACE_ID}`,
						() => new HttpResponse(null, { status: 500 }),
					),
				);

				renderWithProviders(<List />, { isAuth: true });

				// Wait for list to load
				await waitFor(() => {
					expect(screen.getByTestId("delete-button")).toBeInTheDocument();
				});

				const deleteButton = screen.getByTestId("delete-button");

				await act(async () => {
					fireEvent.click(deleteButton);
				});

				// deleteButton.click();
				// const deleteModal = await screen.findByTestId("delete-modal");
				const confirmButton = await screen.findByTestId(
					"delete-place-confirm-button",
				);

				confirmButton.click();

				await waitFor(() => {
					expect(
						screen.getByText("Could not delete place. Please try again."),
					).toBeInTheDocument();
				});
			});

			test("modal should close on close button click", async () => {
				renderWithProviders(<List />, { isAuth: true });

				// Wait for list to load
				await waitFor(() => {
					expect(screen.getByTestId("delete-button")).toBeInTheDocument();
				});

				const deleteButton = screen.getByTestId("delete-button");

				await act(async () => {
					fireEvent.click(deleteButton);
				});

				const closeButton = await screen.findByTestId("modal-close-button");

				await act(async () => {
					closeButton.click();
				});

				await waitFor(() => {
					expect(screen.queryByTestId("delete-modal")).not.toBeInTheDocument();
				});
			});
		});
	});
});
