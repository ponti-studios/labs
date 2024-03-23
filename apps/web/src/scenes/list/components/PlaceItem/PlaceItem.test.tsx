import { screen } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import { MockedFunction, vi } from "vitest";

import { renderWithProviders } from "src/test/utils";
import { ListPlace } from "src/services/types";

import PlaceItem from "./index";

describe("PlaceItem", () => {
  let navigate: MockedFunction<typeof useNavigate>;
  const place: ListPlace = {
    imageUrl: "https://example.com/image.jpg",
    googleMapsId: "123",
    name: "Place Name",
    types: ["type1", "type2"],
    id: "123",
    itemId: "123",
    description: "Description",
  };

  beforeEach(() => {
    navigate = vi.fn();
    (useNavigate as jest.Mock).mockReturnValue(navigate);
  });

  it("should render", async () => {
    renderWithProviders(<PlaceItem place={place} />);
    const placeItem = await screen.findByTestId("place-item");

    expect(screen.findAllByText("Place Name")).toBeTruthy();

    placeItem.click();
    expect(navigate).toHaveBeenCalledWith(`/places/${place.googleMapsId}`);
  });
});
