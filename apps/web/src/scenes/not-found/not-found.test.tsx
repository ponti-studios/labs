import { screen } from "@testing-library/react";
import { useLocation, useMatch } from "react-router-dom";
import { renderWithProviders } from "src/test/utils";

import NotFound from ".";

describe("not-found", () => {
  it("should render not found for invites route", () => {
    (useLocation as jest.Mock).mockReturnValue({ pathname: "/invites/:id" });
    renderWithProviders(<NotFound />);

    expect(
      screen.getByText("This invite could not be found."),
    ).toMatchSnapshot();
  });

  it("should render not found for list route", () => {
    (useLocation as jest.Mock).mockReturnValue({ pathname: "/" });
    (useMatch as jest.Mock).mockImplementation((path) => {
      if (path === "/list/:id") {
        return true;
      }
      return false;
    });

    renderWithProviders(<NotFound />);

    expect(screen.getByText("This list could not be found.")).toMatchSnapshot();
  });
});
