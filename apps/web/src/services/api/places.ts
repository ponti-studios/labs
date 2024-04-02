import type { AxiosError } from "axios";
import { useState } from "react";
import { type UseMutationOptions, useMutation, useQuery } from "react-query";
import api from ".";
import type { Place } from "../types";

type AddPlaceToListOptions = {
	listIds: string[];
	place: Place;
};

export const useAddPlaceToList = (
	options: UseMutationOptions<unknown, AxiosError, AddPlaceToListOptions>,
) => {
	return useMutation<unknown, AxiosError, AddPlaceToListOptions>(
		({ listIds, place }) => {
			return api.post("/lists/place", {
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

export const useGetPlace = (id: string) => {
	const [formattedError, setFormattedError] = useState<string | null>(null);
	const query = useQuery<Place, AxiosError>(
		["place", id],
		async () => {
			setFormattedError(null);
			return api.get(`/places/${id}`).then((res) => res.data);
		},
		{
			refetchOnWindowFocus: false,
			refetchOnMount: false,
			onSuccess: () => {
				setFormattedError(null);
			},
			onError: (error) => {
				if (error.response?.status === 404) {
					setFormattedError("Place not found.");
					return;
				}

				if (error.response?.status === 403) {
					setFormattedError("You do not have permission to view this place.");
					return;
				}

				if (error.response?.status === 500) {
					setFormattedError(
						"An error occurred while fetching the place. Please try again later.",
					);
					return;
				}

				setFormattedError(error.message);
			},
		},
	);

	return { ...query, formattedError };
};
