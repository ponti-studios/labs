import { Map as GoogleMap, MapProps } from "@vis.gl/react-google-maps";
import { useCallback } from "react";

import { MapMouseEvent } from "@vis.gl/react-google-maps/dist/components/map/use-map-events";
import styled from "@emotion/styled";
import { Place } from "src/services/types";

const Loading = styled.div`
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  max-width: max-content;
  position: absolute;
`;

type RoccoMapProps = MapProps & {
  isLoadingCurrentLocation: boolean;
  setSelected: (place: Place) => void;
  selected: Place | null;
  zoom: number;
  center: google.maps.LatLngLiteral;
  onMapClick: (event: MapMouseEvent) => void;
  onMarkerClick: () => void;
};
const Map = ({
  zoom,
  center,
  isLoadingCurrentLocation,
  onMapClick,
  selected,
  setSelected,
}: RoccoMapProps) => {
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
    <div className="flex flex-1 relative overflow-hidden rounded-lg shadow-md">
      {isLoadingCurrentLocation ? (
        <Loading className="rounded-lg border-blue-500 bg-blue-200 text-blue-600 z-10 p-1 px-4 text-sm mt-2">
          <span className="animate-ping inline-flex size-1 rounded-full bg-blue-800 opacity-75 mb-[2px] mr-3"></span>
          Loading current location
        </Loading>
      ) : null}
      <GoogleMap
        zoom={zoom}
        center={
          selected
            ? {
                lat: selected.latitude,
                lng: selected.longitude,
              }
            : center
        }
        onClick={onClick}
        className="flex size-full"
      />
    </div>
  );
};

export default Map;
