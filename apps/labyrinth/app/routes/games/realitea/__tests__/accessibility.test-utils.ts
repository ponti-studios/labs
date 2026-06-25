import { act, screen, waitFor } from "@testing-library/react";
import { expect, vi } from "vitest";

/**
 * Verify an aria-live region contains actual text content.
 * Catches bugs where aria-live/status/alert regions exist but are empty.
 */
export function expectAccessibilityMessageContent(
  role: "status" | "alert",
  expectedText?: string | RegExp,
) {
  const element = screen.getByRole(role);

  // First: verify element exists and has content
  expect(element).toBeInTheDocument();

  // Second: verify no empty text content
  const content = element.textContent?.trim() || "";
  expect(content.length).toBeGreaterThan(0);

  // Third: if specific text expected, verify it
  if (expectedText) {
    expect(element).toHaveTextContent(expectedText);
  }

  return element;
}

/**
 * Verify that conditional elements render with their content expressions.
 * Catches bugs like {condition ? <p></p> : null} without {variableName} inside.
 */
export function expectConditionalElementHasContent(role: string, minLength = 1) {
  const element = screen.getByRole(role);
  const content = element.textContent?.trim() || "";

  expect(content.length).toBeGreaterThanOrEqual(minLength);

  return element;
}

/**
 * Verify that error/status messages clear after animation timeout.
 */
export async function expectMessageClearsAfterAnimation(role: "status" | "alert", timeoutMs = 400) {
  const element = screen.getByRole(role);
  const initialContent = element.textContent?.trim();

  expect(initialContent).toBeTruthy();

  await act(async () => {
    vi.advanceTimersByTime(timeoutMs + 50);
  });

  await waitFor(() => {
    // Element either disappears or becomes empty
    const stillElement = screen.queryByRole(role);
    if (stillElement) {
      const finalContent = stillElement.textContent?.trim();
      expect(finalContent).toBe("");
    }
    // If element is gone, that's also correct
  });
}
