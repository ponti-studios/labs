import { useMutation } from "react-query";
import api from ".";

export const useAddLocationToList = (options) => {
  return useMutation(
    ({
      listIds,
      place,
    }: {
      listIds: string[];
      place: google.maps.places.PlaceResult;
    }) => {
      return api.post(`/lists/place`, {
        listIds,
        place: {
          name: place.name,
          address: place.formatted_address,
          location: {
            lat: place.geometry?.location.lat(),
            lng: place.geometry?.location.lng(),
          },
          place_id: place.place_id,
          rating: place.rating,
          price_level: place.price_level,
          types: place.types,
          website: place.website,
          international_phone_number: place.international_phone_number,
        },
      });
    },
    options,
  );
};
