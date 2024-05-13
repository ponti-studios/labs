import { fireEvent, screen, waitFor } from "@testing-library/react";
import React from "react";
import * as reactRouterDom from "react-router-dom";
import { beforeEach, describe, expect, test } from "vitest";
import { vi } from "vitest";

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
		renderWithProviders(<Login />);
		const input = await screen.findByTestId("email-input");
		const button = await screen.findByTestId("login-button");
		testServer.use(
			http.post(`${baseURL}/login`, () => {
				return HttpResponse.text("OK", { status: 200 });
			}),
		);
		fireEvent.change(input, { target: { value: "test@test.com" } });
		fireEvent.click(button);

		await waitFor(() => {
			expect(navigate).toHaveBeenCalledWith("/authenticate");
		});
	});
});
