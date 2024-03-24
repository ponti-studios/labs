import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { useParams, useNavigate } from "react-router-dom";
import { beforeEach, describe, expect, Mock, test, vi } from "vitest";

import api from "src/services/api";
import { baseURL } from "src/services/api/base";
import { useAuth } from "src/services/store";
import { MOCK_PLACE } from "src/test/mocks/place";
import { TEST_LIST_ID, testServer } from "src/test/test.setup";
import { renderWithProviders } from "src/test/utils";

import List from ".";

describe("List", () => {
  beforeEach(() => {
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

  describe.skip("delete list item", () => {
    test("should make DELETE API request on enter click", async () => {
      renderWithProviders(<List />, { isAuth: true });

      // Wait for list to load
      await waitFor(() => {
        expect(screen.getByTestId("delete-place-button")).toBeInTheDocument();
      });

      const deleteButton = await screen.getByTestId("delete-place-button");

      await act(async () => {
        fireEvent.keyDown(deleteButton, { key: "Enter", code: "Enter" });
      });

      expect(api.delete).toHaveBeenCalledWith(
        `${baseURL}/lists/list-id/place/place-id`,
      );
    });

    test("should make DELETE API request on button click", async () => {
      renderWithProviders(<List />, { isAuth: true });

      // Wait for list to load
      await waitFor(() => {
        expect(screen.getByTestId("delete-place-button")).toBeInTheDocument();
      });

      const deleteButton = screen.getByTestId("delete-place-button");

      await act(async () => {
        fireEvent.click(deleteButton);
      });

      expect(api.delete).toHaveBeenCalledWith(
        `${baseURL}/lists/list-id/place/place-id`,
      );
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
  });
});
