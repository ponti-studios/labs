import { act, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test } from "vitest";
import type { Mock } from "vitest";

import { useAuth } from "src/services/store";
import { renderWithProviders } from "src/test/utils";

import AuthNavMenu from ".";

describe("AuthNavMenu", () => {
	beforeEach(() => {
		(useAuth as Mock).mockReturnValue({
			user: { email: "test@gmail.com" },
		});
	});

	test("it should open the dropdown when the user clicks on the menu button", async () => {
		renderWithProviders(<AuthNavMenu />);
		const menuButton = await screen.findByTestId("dropdown-button");

		await act(async () => {
			menuButton.click();
		});

		await waitFor(() => {
			expect(screen.getByTestId("dropdown").attributes).toHaveProperty("open");
		});
	});
});
