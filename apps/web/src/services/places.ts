import { createSlice } from "@reduxjs/toolkit";

import api from "./api";
import { useAppDispatch } from "./hooks";
import { Place } from "./types";

const initialState: {
  isOpen: boolean;
  listId?: string;
  onClose: () => void;
  place?: Place;
} = {
  isOpen: false,
  listId: null,
  place: null,
  onClose: null,
};

export const placesSlice = createSlice({
  name: "places",
  initialState,
  reducers: {
    openPlaceModal(state, action) {
      state.isOpen = true;
      state.place = action.payload.place;
      state.listId = action.payload.listId;
      state.onClose = action.payload.onClose;
    },
    closePlaceModal(state) {
      state.isOpen = false;
      state.place = null;
      state.onClose?.();
      state.onClose = null;
    },
  },
});

export const usePlaceModal = () => {
  const dispatch = useAppDispatch();

  const openPlaceModal = ({
    listId,
    place,
    onClose,
  }: {
    listId?: string;
    place: Place;
    onClose?: () => void;
  }) => {
    return dispatch(
      placesSlice.actions.openPlaceModal({ listId, place, onClose }),
    );
  };

  const closePlaceModal = () => {
    return dispatch(placesSlice.actions.closePlaceModal());
  };

  return {
    closePlaceModal,
    openPlaceModal,
  };
};

export function usePlacesService() {
  const getPlace = async ({ googleMapsId }: { googleMapsId: string }) => {
    const response = await api.get<Place>(`/places/${googleMapsId}`);
    const place = response.data;

    place.lat =
      typeof place.lat === "number" ? place.lat : parseFloat(place.lat);
    place.lng =
      typeof place.lng === "number" ? place.lng : parseFloat(place.lng);

    return place;
  };

  const textSearch = async (
    request: google.maps.places.TextSearchRequest,
  ): Promise<Place[]> => {
    const response = await api.get<Place[]>(`/places/search`, {
      params: {
        query: request.query,
        latitude: request.location.lat,
        longitude: request.location.lng,
        radius: request.radius,
      },
    });

    return response.data;
  };

  return {
    textSearch,
    getPlace,
  };
}
