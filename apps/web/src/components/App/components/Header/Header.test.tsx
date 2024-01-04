import { screen } from "@testing-library/react";
import { test, expect, describe } from "vitest";
import { renderWithProviders } from "src/test/utils";

import Header from ".";

describe("<Header/>", () => {
  test("should render component", () => {
    renderWithProviders(<Header />);
    expect(screen.getByText("Log In")).toBeTruthy();
  });
});
