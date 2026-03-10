import { clickEnabledButton, fillSymptomInput } from "@/test.utils";
import { expect, test } from "@playwright/test";

test.describe("Home page", () => {
	test("should load the home page correctly", async ({ page }) => {
		await page.goto("/");

		// Check if the title is correct
		await expect(page.locator("h1")).toContainText("symptom guidance");

		// Check if the form exists
		await expect(page.locator("form")).toBeVisible();

		// Check if the input and button exist
		await expect(
			page.locator('input[placeholder="Enter symptom"]'),
		).toBeVisible();
		await expect(page.locator('button[type="submit"]')).toContainText("Check");

		// Check if the button is disabled when input is empty
		await expect(page.locator('button[type="submit"]')).toBeDisabled();
	});

	test("should display error when no matches found", async ({ page }) => {
		await page.goto("/");
		await fillSymptomInput(page, "xyznonexistentsymptom");
		await clickEnabledButton(page);

		// Wait for the error message
		await expect(page.locator("[class*='bg-destructive']")).toBeVisible();
		await expect(page.locator("[class*='bg-destructive']")).toContainText(
			"No matching symptoms found",
		);
	});

	test("should search for a symptom and display results", async ({ page }) => {
		await page.goto("/");
		await fillSymptomInput(page, "headache");
		await clickEnabledButton(page);

		// Check if the symptom card appears
		await expect(
			page.locator('[data-testid="symptom-name"]').first(),
		).toBeVisible({
			timeout: 5000,
		});

		// Check if the severity score is displayed
		const mainDiagnosisSeverity = page
			.locator("[data-testid='symptom-severity']")
			.first();
		await expect(mainDiagnosisSeverity).toBeVisible();

		// Check if recommended action section is displayed
		await expect(
			page.locator('h4:has-text("Recommended Action:")'),
		).toBeVisible();
	});

	test("should disable form during API request", async ({ page }) => {
		await page.goto("/");
		await fillSymptomInput(page, "headache");
		await clickEnabledButton(page);

		// The button should show "Checking..." and be disabled during the request
		const submitButton = page.locator('button[type="submit"]');
		await expect(submitButton).toContainText("Checking...");
		await expect(submitButton).toBeDisabled();
		await expect(
			page.locator('input[placeholder="Enter symptom"]'),
		).toBeDisabled();

		// After the request is complete, the button should return to normal
		// const submitButton = page.locator('button[type="submit"]');
		await expect(submitButton).toContainText("Check");

		await expect(
			page.locator('input[placeholder="Enter symptom"]'),
		).toBeEnabled({ timeout: 5000 });
	});
});
