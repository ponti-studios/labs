import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
export function usePlacesService() {
  const placesLibrary = useMapsLibrary("places");
  const [placesService, setPlacesService] =
    useState<google.maps.places.PlacesService | null>(null);

  useEffect(() => {
    if (!placesLibrary) return;

    setPlacesService(
      new placesLibrary.PlacesService(document.createElement("div")),
    );
  }, [placesLibrary]);

  return placesService;
}
