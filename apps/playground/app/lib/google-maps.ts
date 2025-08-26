import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import "../types/google-maps";

export interface Location {
	lat: number;
	lng: number;
	address: string;
}

export interface DirectionsResult {
	summary: {
		from: string;
		to: string;
		distance: string;
		duration: string;
	};
	steps: Array<{
		instruction: string;
		distance: string;
	}>;
}

export const cleanHtmlFromInstructions = (htmlString: string): string => {
	const tempDiv = document.createElement("div");
	tempDiv.innerHTML = htmlString;

	// Get text content (removes all HTML tags and decodes HTML entities)
	const text = tempDiv.textContent || tempDiv.innerText || "";

	return text;
};

export const geocodeLocation = async (address: string): Promise<Location[]> => {
	if (!window.google) {
		throw new Error("Google Maps API not loaded");
	}

	return new Promise((resolve, reject) => {
		const geocoder = new window.google.maps.Geocoder();
		geocoder.geocode({ address }, (results, status) => {
			if (status === "OK" && results) {
				const locations: Location[] = results.map((result) => {
					if (!result.geometry?.location) {
						throw new Error("Invalid location data");
					}
					return {
						lat: result.geometry.location.lat(),
						lng: result.geometry.location.lng(),
						address: result.formatted_address || "Unknown location",
					};
				});
				resolve(locations);
			} else {
				reject(new Error(`Geocoding failed: ${status}`));
			}
		});
	});
};

export const getDirections = async (
	origin: string,
	destination: string,
): Promise<DirectionsResult> => {
	if (!window.google) {
		throw new Error("Google Maps API not loaded");
	}

	return new Promise((resolve, reject) => {
		const directionsService = new window.google.maps.DirectionsService();
		directionsService.route(
			{
				origin,
				destination,
				travelMode: window.google.maps.TravelMode.DRIVING,
			},
			(result, status) => {
				if (status === "OK" && result) {
					const route = result.routes[0];
					const leg = route.legs[0];

					const directionsResult: DirectionsResult = {
						summary: {
							from: leg.start_address,
							to: leg.end_address,
							distance: leg.distance?.text || "Unknown",
							duration: leg.duration?.text || "Unknown",
						},
						steps: leg.steps.map((step) => ({
							instruction: cleanHtmlFromInstructions(step.instructions),
							distance: step.distance?.text || "",
						})),
					};
					resolve(directionsResult);
				} else {
					reject(new Error(`Directions failed: ${status}`));
				}
			},
		);
	});
};

export const useGeocodeLocation = (address: string | null) => {
	return useQuery({
		queryKey: ["geocode", address],
		queryFn: () => {
			if (!address) {
				throw new Error("Address is required");
			}
			return geocodeLocation(address);
		},
		enabled: !!address && address.trim().length > 0,
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		retry: 2,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	});
};

export const useGetDirections = () => {
	return useMutation({
		mutationFn: ({
			origin,
			destination,
		}: {
			origin: string;
			destination: string;
		}) => getDirections(origin, destination),
		retry: 2,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	});
};

// Custom hook for managing Google Maps queries
export const useGoogleMapsQueries = () => {
	const queryClient = useQueryClient();

	const clearAllQueries = () => {
		queryClient.removeQueries({ queryKey: ["geocode"] });
		queryClient.removeQueries({ queryKey: ["directions"] });
	};

	return { clearAllQueries };
};

// Utility function to check if Google Maps API is loaded
export const isGoogleMapsLoaded = (): boolean => {
	return typeof window !== "undefined" && !!window.google;
};

// Utility function to load Google Maps API
export const loadGoogleMapsAPI = (apiKey: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		if (isGoogleMapsLoaded()) {
			resolve();
			return;
		}

		const script = document.createElement("script");
		script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places`;
		script.async = true;
		script.defer = true;
		script.onload = () => resolve();
		script.onerror = () => reject(new Error("Failed to load Google Maps API"));
		document.head.appendChild(script);
	});
};
