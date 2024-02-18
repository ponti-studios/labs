import { createSlice } from "@reduxjs/toolkit";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import { useAppDispatch } from "./hooks";
import { Place } from "./types";
import { getDefaultImageUrl } from "./api/places";

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
  const placesLibrary = useMapsLibrary("places");
  const [placesService, setPlacesService] =
    useState<google.maps.places.PlacesService | null>(null);

  useEffect(() => {
    if (!placesLibrary) return;

    setPlacesService(
      new placesLibrary.PlacesService(document.createElement("div")),
    );
  }, [placesLibrary]);

  const getPlaceDetails = (request: google.maps.places.PlaceDetailsRequest) => {
    return new Promise<Place>((resolve, reject) => {
      placesService.getDetails(request, (place, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK) {
          reject(status);
        }
        resolve({
          address: place.formatted_address,
          name: place.name,
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng(),
          types: place.types,
          website: place.website,
          imageUrl: getDefaultImageUrl(place),
          photos: place.photos.map((photo) => photo.getUrl()),
          place_id: place.place_id,
          rating: place.rating,
          price_level: place.price_level,
          international_phone_number: place.international_phone_number,
        });
      });
    });
  };

  const textSearch = (request: google.maps.places.TextSearchRequest) => {
    return new Promise<Place[]>((resolve, reject) => {
      placesService.textSearch(request, (response, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK) {
          reject(status);
        }
        resolve(
          response.map((place) => ({
            address: place.formatted_address,
            name: place.name,
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
            types: place.types,
            website: place.website,
            imageUrl: getDefaultImageUrl(place),
            photos: place.photos?.map((photo) => photo.getUrl()),
            place_id: place.place_id,
            rating: place.rating,
            price_level: place.price_level,
            international_phone_number: place.international_phone_number,
          })),
        );
      });
    });
  };

  return {
    textSearch,
    getPlaceDetails,
  };
}
