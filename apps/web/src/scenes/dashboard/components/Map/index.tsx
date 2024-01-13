import { GoogleMap, Marker } from "@react-google-maps/api";
import { useCallback } from "react";

import styles from "./Map.module.css";

type MapProps = {
  setSelected: (place: google.maps.places.PlaceResult) => void;
  selected: google.maps.places.PlaceResult | null;
  zoom: number;
  center: google.maps.LatLngLiteral;
  onMapClick: (e: google.maps.MapMouseEvent) => void;
  onMarkerClick: () => void;
};
const Map = ({
  zoom,
  center,
  onMapClick,
  onMarkerClick,
  selected,
  setSelected,
}: MapProps) => {
  const onMapLoad = useCallback(
    (map) => {
      map?.addListener("click", (event) => {
        // Remove currently selected marker
        setSelected(null);

        // Hide info window
        if (event.placeId) {
          if (event?.stop) event.stop();
        }
      });
    },
    [setSelected],
  );

  return (
    <GoogleMap
      zoom={zoom}
      center={center}
      onClick={onMapClick}
      onLoad={onMapLoad}
      mapContainerClassName={styles.mapContainer}
    >
      {selected && <Marker position={center} onClick={onMarkerClick} />}
    </GoogleMap>
  );
};

export default Map;
