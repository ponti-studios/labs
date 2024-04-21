import { act, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test } from "vitest";

import { getMockUser, renderWithProviders } from "src/test/utils";

import AuthNavMenu from ".";

describe("AuthNavMenu", () => {
	test("it should open the dropdown when the user clicks on the menu button", async () => {
		renderWithProviders(<AuthNavMenu user={getMockUser()} />);
		const menuButton = await screen.findByTestId("dropdown-button");

		await act(async () => {
			menuButton.click();
		});

		await waitFor(() => {
			expect(screen.getByTestId("dropdown").attributes).toHaveProperty("open");
		});
	});
});
