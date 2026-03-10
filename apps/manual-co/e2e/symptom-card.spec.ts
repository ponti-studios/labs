import { clickEnabledButton, fillSymptomInput } from "@/test.utils";
import { expect, test } from "@playwright/test";

test.describe("SymptomCard component", () => {
	// Test for a high severity symptom
	test("should display a high severity symptom correctly", async ({ page }) => {
		await page.goto("/");
		await fillSymptomInput(page, "chest pain");
		await clickEnabledButton(page);

		// Wait for card to appear
		await expect(page.locator('[data-testid="symptom-name"]')).toBeVisible({
			timeout: 5000,
		});

		// The title should contain the symptom name
		await expect(page.locator('[data-testid="symptom-name"]')).toContainText(
			"chest pain",
			{ ignoreCase: true },
		);

		// Check for high severity score (red background)
		const severityElement = page
			.locator("[data-testid='symptom-severity']")
			.first();
		await expect(severityElement).toBeVisible();
		await expect(severityElement).toHaveClass(/bg-destructive/);

		// Check for immediate care guidance
		await expect(page.locator("text=Recommended Action:")).toBeVisible();
		await expect(
			page.locator("text=Seek immediate medical attention"),
		).toBeVisible();

		// Check for hospital finder button
		await expect(
			page.getByRole("button", { name: /find immediate/i }),
		).toBeVisible();
	});

	// Test for a medium severity symptom
	test("should display a medium severity symptom correctly", async ({
		page,
	}) => {
		await page.goto("/");
		await fillSymptomInput(page, "night sweats");
		await clickEnabledButton(page);

		// Wait for card to appear
		await expect(page.locator('[data-testid="symptom-name"]')).toBeVisible({
			timeout: 5000,
		});

		// Check for medium severity score (amber background)
		const severityElement = page
			.locator("[data-testid='symptom-severity']")
			.first();
		await expect(severityElement).toBeVisible();
		await expect(severityElement).toHaveClass(/bg-amber-500/);

		// Check for non-immediate care guidance
		await expect(page.locator("text=Schedule an appointment")).toBeVisible();

		// Check for appointment button
		await expect(
			page.getByRole("button", { name: /schedule appointment/i }),
		).toBeVisible();
	});

	// Test for a low severity symptom
	test("should display a low severity symptom correctly", async ({ page }) => {
		await page.goto("/");
		await fillSymptomInput(page, "irregular periods");
		await clickEnabledButton(page);

		// Wait for card to appear
		await expect(page.locator('[data-testid="symptom-name"]')).toBeVisible({
			timeout: 5000,
		});

		// Check for low severity score (green background)
		const severityElement = page
			.locator("[data-testid='symptom-severity']")
			.first();
		await expect(severityElement).toBeVisible();
		await expect(severityElement).toHaveClass(/bg-green-500/);

		// Check for self-care guidance
		await expect(
			page.locator("text=Monitor symptoms and practice self-care"),
		).toBeVisible();

		// Check for monitor symptoms button
		await expect(
			page.getByRole("button", { name: /monitor symptoms/i }),
		).toBeVisible();
	});

	// Test for alternative symptoms
	test("should display alternative symptoms correctly", async ({ page }) => {
		await page.goto("/");
		await fillSymptomInput(page, "headache");
		await clickEnabledButton(page);

		// Wait for the main result
		const mainDiagnosis = page.locator('[data-testid="symptom-name"]').first();
		await expect(mainDiagnosis).toBeVisible({
			timeout: 5000,
		});

		// Wait for alternative matches section
		await expect(page.locator("text=Alternative Matches")).toBeVisible({
			timeout: 5000,
		});

		// Check if alternative cards are displayed
		await expect(page.locator(".carousel-item")).toBeVisible();

		// Alternative cards should NOT show the "Recommended Action" section
		const alternativeCards = page.locator(".carousel-item");

		// Get the count of alternative cards
		const count = await alternativeCards.count();

		// Make sure there is at least one alternative
		expect(count).toBeGreaterThan(0);

		// Check that the first alternative doesn't have a recommended action section
		const firstAlternative = alternativeCards.first();
		await expect(
			firstAlternative.locator("text=Recommended Action:"),
		).not.toBeVisible();
	});
});
