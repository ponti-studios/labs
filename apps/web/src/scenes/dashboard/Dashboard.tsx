import styled from "@emotion/styled";
import Loading from "@hominem/components/Loading";
import type { MapMouseEvent } from "@vis.gl/react-google-maps/dist/components/map/use-map-events";
import React, { useCallback, useEffect, useState } from "react";

import { mediaQueries } from "src/constants/styles";
import { useAppSelector } from "src/services/store";
import type { Place } from "src/services/types";

import { generatePath, useNavigate } from "react-router-dom";
import { PLACE } from "src/constants/routes";
import RoccoMap from "./components/Map";
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

const DEFAULT_CENTER = { latitude: 37.7749, longitude: -122.4194 }; // Default center (San Francisco)

function Dashboard({ isMapLoaded }: { isMapLoaded: boolean }) {
	const [zoom, setZoom] = useState(ZOOM_LEVELS.DEFAULT);
	const currentLocation = useAppSelector((state) => state.auth.currentLocation);
	const [selected, setSelected] = useState<Place | null>(null);
	const [center, setCenter] = useState(currentLocation || DEFAULT_CENTER);
	const navigate = useNavigate();

	const onMapClick = useCallback(
		async (args: MapMouseEvent) => {
			navigate(generatePath(PLACE, { id: args.detail.placeId }));
		},
		[navigate],
	);

	const onSelectedChanged = useCallback((place: Place) => {
		setSelected(place);
		setCenter({
			latitude: place.latitude,
			longitude: place.longitude,
		});
		setZoom(ZOOM_LEVELS.SELECTED);
	}, []);

	const onMarkerClick = useCallback(() => {
		navigate(generatePath(PLACE, { id: selected.googleMapsId }));
	}, [navigate, selected]);

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
			<RoccoMap
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
