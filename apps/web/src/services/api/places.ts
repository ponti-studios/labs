import { UseMutationOptions, useMutation } from "react-query";
import api from ".";
import { Place } from "../types";
import { AxiosError } from "axios";

type AddPlaceToListOptions = {
  listIds: string[];
  place: Place;
};

export const useAddPlaceToList = (
  options: UseMutationOptions<unknown, AxiosError, AddPlaceToListOptions>,
) => {
  return useMutation<unknown, AxiosError, AddPlaceToListOptions>(
    ({ listIds, place }) => {
      return api.post(`/lists/place`, {
        listIds,
        place: {
          name: place.name,
          address: place.address,
          latitude: place.latitude,
          longitude: place.longitude,
          imageUrl: place.imageUrl,
          googleMapsId: place.googleMapsId,
          rating: place.rating,
          price_level: place.price_level,
          types: place.types,
          websiteUri: place.websiteUri,
          phoneNumber: place.phoneNumber,
        },
      });
    },
    options,
  );
};
