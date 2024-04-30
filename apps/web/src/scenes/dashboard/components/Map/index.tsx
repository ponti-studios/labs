import { Map as GoogleMap } from "@vis.gl/react-google-maps";
import { useCallback } from "react";

import styled from "@emotion/styled";
import type { MapMouseEvent } from "@vis.gl/react-google-maps/dist/components/map/use-map-events";
import type { Place, PlaceLocation } from "src/services/types";

const Loading = styled.div`
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  max-width: max-content;
  position: absolute;
`;

type RoccoMapProps = {
	isLoadingCurrentLocation: boolean;
	setSelected: (place: Place) => void;
	zoom: number;
	center: PlaceLocation;
	onMapClick: (event: MapMouseEvent) => void;
	onMarkerClick: () => void;
};
const RoccoMap = ({
	zoom,
	center,
	isLoadingCurrentLocation,
	onMapClick,
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
		<div
			data-testid="rocco-map"
			data-zoom={zoom}
			data-center={JSON.stringify(center)}
			className="flex flex-1 relative overflow-hidden rounded-lg shadow-md size-full"
		>
			{isLoadingCurrentLocation ? (
				<Loading className="rounded-lg border-blue-500 bg-blue-200 text-blue-600 z-10 p-1 px-4 text-sm mt-2">
					<span className="animate-ping inline-flex size-1 rounded-full bg-blue-800 opacity-75 mb-[2px] mr-3" />
					Loading current location
				</Loading>
			) : null}
			<GoogleMap
				zoom={zoom}
				center={{
					lat: center.latitude,
					lng: center.longitude,
				}}
				onClick={onClick}
				className="flex size-full"
			/>
		</div>
	);
};

export default RoccoMap;
