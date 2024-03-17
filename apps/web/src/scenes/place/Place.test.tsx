import { renderWithProviders } from "src/test/utils";
import Place from "./Place";
import { screen } from "@testing-library/react";
import { MOCK_PLACE } from "src/test/mocks/place";

describe("Place", () => {
  it("should render", async () => {
    renderWithProviders(<Place />);
    expect(await screen.findByText(MOCK_PLACE.name)).toBeInTheDocument();
  });
});
