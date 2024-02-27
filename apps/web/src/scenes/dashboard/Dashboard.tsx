import styled from "@emotion/styled";
import { MapMouseEvent } from "@vis.gl/react-google-maps/dist/components/map/use-map-events";
import React, { useCallback, useEffect, useState } from "react";
import Loading from "ui/Loading";

import { mediaQueries } from "src/constants/styles";
import { useAppSelector } from "src/services/hooks";
import { usePlaceModal, usePlacesService } from "src/services/places";
import { Place } from "src/services/types";

import Map from "./components/Map";
import PlacesAutocomplete from "./components/PlacesAutocomplete";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  height: 100%;
  padding-bottom: 32px;

  ${mediaQueries.belowMedium} {
    max-width: calc(100% - 16px);
    margin: 0 auto;
  }
`;

const PlacesAutocompleteWrap = styled.div``;

const ZOOM_LEVELS = {
  DEFAULT: 10,
  SELECTED: 19,
  MARKER: 18,
};

const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 }; // Default center (San Francisco)

function Dashboard({ isMapLoaded }: { isMapLoaded: boolean }) {
  const { openPlaceModal } = usePlaceModal();
  const [zoom, setZoom] = useState(ZOOM_LEVELS.DEFAULT);
  const currentLocation = useAppSelector((state) => state.auth.currentLocation);
  const [selected, setSelected] = useState<Place | null>(null);
  const [center, setCenter] = useState(currentLocation || DEFAULT_CENTER);
  const { getPlace } = usePlacesService();

  const onMapClick = useCallback(
    async (args: MapMouseEvent) => {
      const { placeId, latLng } = args.detail;
      const place = await getPlace({ googleMapsId: placeId });

      if (!place || typeof place === "string") {
        return;
      }

      // Select the clicked location
      setSelected(place);
      setCenter(latLng);
      setZoom(ZOOM_LEVELS.MARKER);
      openPlaceModal({
        onClose: () => {
          setSelected(null);
          setZoom(ZOOM_LEVELS.SELECTED);
        },
        place,
      });
    },
    [getPlace, openPlaceModal],
  );

  const onSelectedChanged = useCallback((place: Place) => {
    setSelected(place);
    setCenter({
      lat: place.lat,
      lng: place.lng,
    });
    setZoom(ZOOM_LEVELS.SELECTED);
  }, []);

  const onMarkerClick = useCallback(() => {
    // The map should zoom slightly when the marker is clicked
    setZoom(ZOOM_LEVELS.MARKER);
    openPlaceModal({
      onClose: () => {
        setSelected(null);
        setZoom(ZOOM_LEVELS.SELECTED);
      },
      place: selected,
    });
  }, [openPlaceModal, selected]);

  useEffect(() => {
    if (currentLocation) {
      setCenter(currentLocation);
    }
  }, [currentLocation]);

  if (!isMapLoaded) {
    return (
      <div className="flex items-center justify-center max-w-[300px] mx-auto min-h-full">
        <Loading size="xl" />
      </div>
    );
  }

  return (
    <Wrap>
      <PlacesAutocompleteWrap>
        <PlacesAutocomplete
          setSelected={onSelectedChanged}
          center={currentLocation}
        />
      </PlacesAutocompleteWrap>
      <Map
        isLoadingCurrentLocation={!currentLocation}
        zoom={zoom}
        center={center}
        onMapClick={onMapClick}
        onMarkerClick={onMarkerClick}
        setSelected={setSelected}
      />
    </Wrap>
  );
}

export default Dashboard;
