import styled from "@emotion/styled";
import React, { useCallback, useRef, useState } from "react";

import { getDetails } from "use-places-autocomplete";

import Loading from "ui/Loading";

import { mediaQueries } from "src/constants/styles";

import PlacesAutocomplete from "./components/PlacesAutocomplete";
import PlaceModal from "./components/PlaceModal";
import Map from "./components/Map";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  height: 100%;

  ${mediaQueries.belowMedium} {
    max-width: calc(100% - 16px);
    margin: 0 auto;
  }
`;

const PlacesAutocompleteWrap = styled.div``;

const ZOOM_LEVELS = {
  DEFAULT: 10,
  SELECTED: 17,
  MARKER: 18,
};

const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 }; // Default center (San Francisco)

function Dashboard({ isMapLoaded }: { isMapLoaded: boolean }) {
  const [zoom, setZoom] = useState(ZOOM_LEVELS.DEFAULT);
  const [selected, setSelected] =
    useState<google.maps.places.PlaceResult | null>(null);
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const modalRef = useRef<HTMLDialogElement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onMapClick = useCallback(async (args) => {
    const place = await getDetails({ placeId: args.placeId });

    if (!place || typeof place === "string") {
      return;
    }

    // Select the clicked location
    setSelected(place);
    setCenter(args.latLng.toJSON());
    setZoom(ZOOM_LEVELS.MARKER);
    setIsModalOpen(true);
  }, []);

  const onSelectedChanged = useCallback(
    (place: google.maps.places.PlaceResult) => {
      const {
        geometry: { location },
      } = place;
      const latLng = { lat: location.lat(), lng: location.lng() };
      setSelected(place);
      setCenter(latLng);
      setZoom(ZOOM_LEVELS.SELECTED);
    },
    [],
  );

  const onMarkerClick = useCallback(() => {
    modalRef.current?.showModal();
    // The map should zoom slightly when the marker is clicked
    setZoom(ZOOM_LEVELS.MARKER);
    setIsModalOpen(true);
  }, [modalRef]);

  const onModalClose = useCallback(() => {
    modalRef.current?.close();
    setSelected(null);
    setIsModalOpen(false);
    setZoom(ZOOM_LEVELS.SELECTED);
  }, []);

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
        <PlacesAutocomplete setSelected={onSelectedChanged} />
      </PlacesAutocompleteWrap>
      <Map
        zoom={zoom}
        center={center}
        onMapClick={onMapClick}
        onMarkerClick={onMarkerClick}
        selected={selected}
        setSelected={setSelected}
      />
      <PlaceModal
        isOpen={isModalOpen}
        place={selected}
        onModalClose={onModalClose}
        ref={modalRef}
      />
    </Wrap>
  );
}

export default Dashboard;
