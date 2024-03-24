import { screen } from "@testing-library/react";
import { useParams } from "react-router-dom";
import { renderWithProviders } from "src/test/utils";
import { MOCK_PLACE } from "src/test/mocks/place";

import Place from "./Place";

describe("Place", () => {
  beforeEach(() => {
    (useParams as jest.Mock).mockReturnValue({ id: MOCK_PLACE.googleMapsId });
  });

  test("should render", async () => {
    renderWithProviders(<Place />);
    expect(await screen.findByText(MOCK_PLACE.name)).toBeInTheDocument();
  });
});
