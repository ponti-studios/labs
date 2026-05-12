import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, test } from "vitest";

import NotFoundPage from "@/app/routes/not-found";

describe("404", () => {
	test("renders a heading", () => {
		render(
			<MemoryRouter>
				<NotFoundPage />
			</MemoryRouter>,
		);

		const heading = screen.getByText(/not found/i);

		expect(heading).to.exist;
	});
});
