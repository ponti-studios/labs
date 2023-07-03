import { GoogleMap, Marker } from "@react-google-maps/api";
import styled from "@emotion/styled";
import React, { useCallback, useState } from "react";

import styles from "./Dashboard.module.css";
import PlacesAutocomplete from "./components/PlacesAutocomplete";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const PlacesAutocompleteWrap = styled.div`
  margin-bottom: 1rem;
`;

function Dashboard({ isMapLoaded }: { isMapLoaded: boolean }) {
  const [zoom, setZoom] = useState(10);
  const [selected, setSelected] = useState(null);
  const [center, setCenter] = useState({ lat: 37.7749, lng: -122.4194 }); // Default center (San Francisco)

  const onSelectedChanged = useCallback((value) => {
    setSelected(value);
    setCenter(value);
    setZoom(17);
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
        {selected && <Marker position={selected} />}
      </GoogleMap>
    </Wrap>
  );
}

export default Dashboard;
