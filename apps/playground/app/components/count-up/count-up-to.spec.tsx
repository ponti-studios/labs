import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import CountUpTo from "./count-up-to";

const delay = async (ms: number) =>
	new Promise((resolve) => setTimeout(resolve, ms));

describe("CountUpTo", () => {
	test("should render and count up to target value", async () => {
		render(<CountUpTo value={100} duration={0.5} />);

		// Initially should show 0 or be starting the animation
		expect(screen.getByText("0")).toBeInTheDocument();

		// Wait for animation to complete
		await waitFor(
			() => {
				expect(screen.getByText("100")).toBeInTheDocument();
			},
			{ timeout: 1000 },
		);
	});

	test("should format numbers with separators", async () => {
		render(<CountUpTo value={1000} duration={0.1} />);

		await waitFor(
			() => {
				expect(screen.getByText("1,000")).toBeInTheDocument();
			},
			{ timeout: 500 },
		);
	});

	test("should handle decimals", async () => {
		render(<CountUpTo value={99.99} decimals={2} duration={0.1} />);

		await waitFor(
			() => {
				expect(screen.getByText("99.99")).toBeInTheDocument();
			},
			{ timeout: 500 },
		);
	});

	test("should handle prefix and suffix", async () => {
		render(<CountUpTo value={50} prefix="$" suffix="%" duration={0.1} />);

		await waitFor(
			() => {
				expect(screen.getByText("$50%")).toBeInTheDocument();
			},
			{ timeout: 500 },
		);
	});

	test("should handle custom start value", async () => {
		render(<CountUpTo value={100} start={50} duration={0.1} />);

		await waitFor(
			() => {
				expect(screen.getByText("100")).toBeInTheDocument();
			},
			{ timeout: 500 },
		);
	});
});
