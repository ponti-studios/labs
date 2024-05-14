import { screen, waitFor } from "@testing-library/react";
import React from "react";
import { describe, expect, test } from "vitest";

import { Component as Account } from "src/scenes/account";
import { TEST_USER_NAME, renderWithProviders } from "src/test/utils";

describe("Account", () => {
	test("renders when loading = true", async () => {
		renderWithProviders(<Account />, { isAuth: true });

		await waitFor(() => {
			expect(screen.queryByText(TEST_USER_NAME)).toBeInTheDocument();
		});
	});
});
