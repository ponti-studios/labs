import { useApiIsLoaded } from "@vis.gl/react-google-maps";
import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";

import * as ROUTES from "src/constants/routes";
import Account from "src/scenes/account";
import Dashboard from "src/scenes/dashboard";
import Invites from "src/scenes/invites";
import List from "src/scenes/list";
import ListInvites from "src/scenes/list/invites";
import Lists from "src/scenes/lists";
import NotFound from "src/scenes/not-found";
import Place from "src/scenes/place";
import { setCurrentLocation } from "src/services/auth";
import { useAppDispatch } from "src/services/store";

import Toast from "../../Toast";

const AuthenticatedRoutes = () => {
	const isMapLoaded = useApiIsLoaded();
	const dispatch = useAppDispatch();

	useEffect(() => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position: GeolocationPosition) => {
					dispatch(
						setCurrentLocation({
							latitude: position.coords.latitude,
							longitude: position.coords.longitude,
						}),
					);
				},
			);
		} else {
			// !TODO Browser doesn't support Geolocation
			// handleLocationError(false, infoWindow, map.getCenter()!);
		}
	}, [dispatch]);

	return (
		<div
			data-testid="authenticated-scenes"
			className="flex flex-col flex-1 mx-auto"
		>
			<Routes>
				<Route
					path={ROUTES.DASHBOARD}
					element={<Dashboard isMapLoaded={isMapLoaded} />}
				/>
				<Route path={ROUTES.ACCOUNT} element={<Account />} />
				<Route path={ROUTES.INVITES} element={<Invites />} />
				<Route path={ROUTES.LISTS} element={<Lists />} />
				<Route path={ROUTES.LIST} element={<List />} />
				<Route path={ROUTES.LIST_INVITE} element={<ListInvites />} />
				<Route path={ROUTES.PLACE} element={<Place />} />
				<Route path={ROUTES.WILDCARD} element={<NotFound />} />
			</Routes>
			<Toast />
		</div>
	);
};

export default AuthenticatedRoutes;
