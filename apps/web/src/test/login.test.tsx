import { fireEvent, screen, waitFor } from "@testing-library/react";
import React from "react";
import * as reactRouterDom from "react-router-dom";
import { beforeEach, describe, expect, test } from "vitest";
import { vi } from "vitest";

import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { baseURL } from "src/lib/api/base";
import Login from "src/scenes/login";
import { renderWithProviders } from "src/test/utils";
import { testServer } from "./test.setup";

describe("Login", () => {
	const navigate = vi.fn();

	beforeEach(() => {
		vi.spyOn(reactRouterDom, "useNavigate").mockReturnValue(navigate);
	});

	test("renders when loading = true", async () => {
		const user = userEvent.setup();
		testServer.use(
			http.post(`${baseURL}/login`, () => {
				return HttpResponse.text("OK", { status: 200 });
			}),
		);

		renderWithProviders(<Login />);
		fireEvent.change(screen.getByTestId("email-input"), {
			target: { value: "test@test.com" },
		});
		await user.click(screen.getByTestId("login-button"));
		await waitFor(() => {
			expect(navigate).toHaveBeenCalledWith("/authenticate");
		});
	});
});
