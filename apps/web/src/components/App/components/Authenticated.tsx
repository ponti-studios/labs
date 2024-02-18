import { useApiIsLoaded } from "@vis.gl/react-google-maps";
import { List as ListIcon, Mail, Search } from "lucide-react";
import { useEffect, useRef } from "react";
import { Link, Route, Routes } from "react-router-dom";

import * as ROUTES from "src/constants/routes";
import Account from "src/scenes/account";
import Dashboard from "src/scenes/dashboard";
import Invites from "src/scenes/invites";
import List from "src/scenes/list";
import ListInvites from "src/scenes/list/invites";
import Lists from "src/scenes/lists";
import NotFound from "src/scenes/not-found";
import { setCurrentLocation } from "src/services/auth";
import { useAppDispatch, useAppSelector } from "src/services/hooks";

import PlaceModal from "../../PlaceModal";
import Toast from "../../Toast";

const AuthenticatedScenes = () => {
  const isMapLoaded = useApiIsLoaded();
  const dispatch = useAppDispatch();
  const placeModalState = useAppSelector((state) => state.placeModal);
  const modalRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          dispatch(setCurrentLocation(pos));
        },
      );
    } else {
      // !TODO Browser doesn't support Geolocation
      // handleLocationError(false, infoWindow, map.getCenter()!);
    }
  }, [dispatch]);

  return (
    <div className="flex flex-col flex-1 px-2 sm:p-0 sm:max-w-3xl mx-auto">
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
        <Route path={ROUTES.WILDCARD} element={<NotFound />} />
      </Routes>
      <div className="sm:hidden btm-nav relative z-[55]">
        <Link to={ROUTES.DASHBOARD} className="text-black">
          <Search className="inline-block" />
        </Link>
        <Link to={ROUTES.LISTS} className="text-black">
          <span className="inline-block relative">
            <ListIcon className="inline-block" />
          </span>
        </Link>
        <Link to={ROUTES.INVITES} className="text-black">
          <Mail className="inline-block" />
        </Link>
      </div>
      <Toast />
      <PlaceModal
        isOpen={placeModalState.isOpen}
        place={placeModalState.place}
        onModalClose={placeModalState.onClose}
        ref={modalRef}
      />
    </div>
  );
};

export default AuthenticatedScenes;
