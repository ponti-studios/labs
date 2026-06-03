import { expect, type Page } from "@playwright/test";

export async function fillSymptomInput(page: Page, symptom: string) {
  const input = page.locator('input[placeholder="Enter symptom"]');
  await expect(input).toBeVisible();
  await input.fill(symptom);
}

export async function clickEnabledButton(page: Page) {
  const button = page.locator('button[type="submit"]');
  await expect(button).toBeEnabled();
  await button.click();
}
