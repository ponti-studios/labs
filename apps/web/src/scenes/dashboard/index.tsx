import styled from "@emotion/styled";
import Loading from "@hominem/components/Loading";
import { useApiIsLoaded } from "@vis.gl/react-google-maps";
import type { MapMouseEvent } from "@vis.gl/react-google-maps/dist/components/map/use-map-events";
import React, { useCallback, useEffect, useState } from "react";
import { generatePath, useNavigate } from "react-router-dom";

import Lists from "src/components/Lists";
import RoccoMap from "src/components/Map";
import PlacesAutocomplete from "src/components/PlacesAutocomplete";
import { useGetLists } from "src/lib/api";
import { useAuth } from "src/lib/auth";
import type { Place } from "src/lib/types";
import { PLACE } from "src/lib/utils/routes";
import { mediaQueries } from "src/lib/utils/styles";

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

export const ZOOM_LEVELS = {
	DEFAULT: 10,
	SELECTED: 19,
	MARKER: 18,
};

function Dashboard() {
	const { currentLocation, user, setCurrentLocation } = useAuth();
	const [selected, setSelected] = useState<Place | null>(null);
	const [center, setCenter] = useState(currentLocation);
	const navigate = useNavigate();
	const { data, error, status: listsStatus } = useGetLists();
	const isMapLoaded = useApiIsLoaded();

	useEffect(() => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position: GeolocationPosition) => {
					setCurrentLocation({
						latitude: position.coords.latitude,
						longitude: position.coords.longitude,
					});
				},
			);
		} else {
			// !TODO Browser doesn't support Geolocation
			// handleLocationError(false, infoWindow, map.getCenter()!);
		}
	}, [setCurrentLocation]);

	const onMapClick = useCallback(
		async (args: MapMouseEvent) => {
			navigate(generatePath(PLACE, { id: args.detail.placeId }));
		},
		[navigate],
	);

	const onSelectedChanged = useCallback(
		(place: Place) => {
			navigate(generatePath(PLACE, { id: place.googleMapsId }));
		},
		[navigate],
	);

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
			<div className="min-h-60 h-60">
				<RoccoMap
					isLoadingCurrentLocation={!currentLocation}
					zoom={ZOOM_LEVELS.DEFAULT}
					center={center}
					onMapClick={onMapClick}
					onMarkerClick={onMarkerClick}
					setSelected={setSelected}
				/>
			</div>
			<Lists
				status={listsStatus}
				lists={data}
				error={error}
				currentUserEmail={user?.email}
			/>
		</Wrap>
	);
}

export const Component = Dashboard;
