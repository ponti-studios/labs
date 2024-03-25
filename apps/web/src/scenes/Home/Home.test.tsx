import { screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { renderWithProviders } from "src/test/utils";

import Home from ".";

describe("Home", () => {
  test("renders", () => {
    renderWithProviders(<Home />);
    expect(screen.getByText("Make the world yours.")).toBeInTheDocument();
  });
});
