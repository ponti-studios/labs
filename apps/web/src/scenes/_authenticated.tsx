import { useApiIsLoaded } from "@vis.gl/react-google-maps";
import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";

import Toast from "src/components/Toast";
import { useAuth } from "src/lib/auth";
import * as ROUTES from "src/lib/utils/routes";
import Account from "src/scenes/account";
import Dashboard from "src/scenes/dashboard";
import Invites from "src/scenes/invites";
import List from "src/scenes/list";
import ListInvites from "src/scenes/list/invites";
import Lists from "src/scenes/lists";
import NotFound from "src/scenes/not-found";
import Place from "src/scenes/place";

const AuthenticatedRoutes = () => {
	const { setCurrentLocation } = useAuth();
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
