import styled from "@emotion/styled";
import { GoogleMap, Marker } from "@react-google-maps/api";
import React, { useCallback, useState } from "react";

import PlacesAutocomplete from "./components/PlacesAutocomplete";
import styles from "./Dashboard.module.css";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  height: 100%;

  @media screen and (max-width: 900px) {
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
    []
  );

  const onMarkerClick = useCallback(() => {
    // The map should zoom slightly when the marker is clicked
    setZoom(ZOOM_LEVELS.MARKER);
  }, []);

  if (!isMapLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <Wrap>
      <PlacesAutocompleteWrap>
        <PlacesAutocomplete setSelected={onSelectedChanged} />
      </PlacesAutocompleteWrap>
      <GoogleMap
        zoom={zoom}
        center={center}
        mapContainerClassName={styles.mapContainer}
      >
        {selected && <Marker position={center} onClick={onMarkerClick} />}
      </GoogleMap>
    </Wrap>
  );
}

export default Dashboard;
