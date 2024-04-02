import { screen } from "@testing-library/react";
import { renderWithProviders } from "src/test/utils";
import { describe, expect, test } from "vitest";

import Header from ".";

describe("<Header/>", () => {
	test("should render component", () => {
		renderWithProviders(<Header />);
		expect(screen.getByText("Log In")).toBeTruthy();
	});
});
