import { createSlice } from "@reduxjs/toolkit";

import api from "./api";
import { useAppDispatch } from "./hooks";
import { Place, PlaceLocation } from "./types";
import { useQuery } from "react-query";
import { AxiosError } from "axios";

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

type TextSearchQuery = {
  query: string;
  latitude: PlaceLocation["latitude"];
  longitude: PlaceLocation["longitude"];
  radius: number;
};
export const useTextSearch = (params: TextSearchQuery) => {
  return useQuery<Place[], AxiosError, TextSearchQuery>({
    queryKey: ["places/search", params],
    queryFn: async (request) => {
      const response = await api.get<Place[]>(`/places/search`, {
        params: request.queryKey[1],
      });

      return response.data;
    },
  });
};

export function usePlacesService() {
  const getPlace = async ({ googleMapsId }: { googleMapsId: string }) => {
    const response = await api.get<Place>(`/places/${googleMapsId}`);
    return response.data;
  };

  const textSearch = async (request: {
    query: string;
    latitude: PlaceLocation["latitude"];
    longitude: PlaceLocation["longitude"];
    radius: number;
  }): Promise<Place[]> => {
    const response = await api.get<Place[]>(`/places/search`, {
      params: {
        query: request.query,
        latitude: request.latitude,
        longitude: request.longitude,
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
