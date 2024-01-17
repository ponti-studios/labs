import { Map as GoogleMap, Marker } from "@vis.gl/react-google-maps";
import { useCallback } from "react";

import styles from "./Map.module.css";
import { MapMouseEvent } from "@vis.gl/react-google-maps/dist/components/map/use-map-events";

type MapProps = {
  setSelected: (place: google.maps.places.PlaceResult) => void;
  selected: google.maps.places.PlaceResult | null;
  zoom: number;
  center: google.maps.LatLngLiteral;
  onMapClick: (event: MapMouseEvent) => void;
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
  const onClick = useCallback(
    (event: MapMouseEvent) => {
      const { placeId } = event.detail;

      // Remove currently selected marker
      setSelected(null);

      // Hide info window
      if (placeId) {
        if (event?.stop) event.stop();
      }

      onMapClick(event);
    },
    [onMapClick, setSelected],
  );

  return (
    <GoogleMap
      zoom={zoom}
      center={center}
      onClick={onClick}
      className={styles.mapContainer}
    >
      {selected && <Marker position={center} onClick={onMarkerClick} />}
    </GoogleMap>
  );
};

export default Map;
