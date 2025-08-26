import { APIProvider, InfoWindow, Marker } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import {
	type Location,
	useGeocodeLocation,
	useGetDirections,
	useGoogleMapsQueries,
} from "../lib/google-maps";
import "../types/google-maps";
import { GOOGLE_MAPS_API_KEY } from "~/lib/constants";
import HominemMap from "../components/HominemMap";
import SearchDirectionsForm from "../components/SearchDirectionsForm";

const GoogleMapsContent = () => {
	const [searchAddress, setSearchAddress] = useState<string | null>(null);
	const [selectedMarker, setSelectedMarker] = useState<Location | null>(null);
	const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.006 });
	const [mapZoom, setMapZoom] = useState(12);

	// React Query hooks
	const geocodeQuery = useGeocodeLocation(searchAddress);
	const directionsMutation = useGetDirections();
	const { clearAllQueries } = useGoogleMapsQueries();

	// Update map center and zoom when geocoding results change
	useEffect(() => {
		if (geocodeQuery.data && geocodeQuery.data.length === 1) {
			setMapCenter({
				lat: geocodeQuery.data[0].lat,
				lng: geocodeQuery.data[0].lng,
			});
			setMapZoom(14);
		}
	}, [geocodeQuery.data]);

	const handleLocationFound = (location: string) => {
		setSearchAddress(location);
		// Clear any previous geocoding errors when starting a new search
		if (geocodeQuery.error) {
			geocodeQuery.refetch();
		}
	};

	const handleDirectionsFound = (directionsData: {
		origin: string;
		destination: string;
	}) => {
		directionsMutation.mutate(directionsData);
		// Clear any previous directions errors when starting a new request
		if (directionsMutation.error) {
			directionsMutation.reset();
		}
	};

	const handleClear = () => {
		setSearchAddress(null);
		setMapCenter({ lat: 40.7128, lng: -74.006 });
		setMapZoom(12);
		clearAllQueries();
		directionsMutation.reset();
	};

	// Determine loading states
	const isGeocodingLoading = geocodeQuery.isFetching;
	const isDirectionsLoading = directionsMutation.isPending;

	// Get current data
	const markers = geocodeQuery.data || [];
	const directions = directionsMutation.data;

	return (
		<div className="relative w-full h-full">
			{/* Global loading overlay only for geocoding */}
			{isGeocodingLoading && (
				<div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
					<div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
				</div>
			)}

			<HominemMap center={mapCenter} zoom={mapZoom}>
				{markers.map((marker: Location) => (
					<Marker
						key={`marker-${marker.lat}-${marker.lng}`}
						position={{ lat: marker.lat, lng: marker.lng }}
						title={marker.address}
						onClick={() => setSelectedMarker(marker)}
					/>
				))}

				{selectedMarker && (
					<InfoWindow
						position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
						onCloseClick={() => setSelectedMarker(null)}
					>
						<div className="p-2">
							<strong>{selectedMarker.address}</strong>
						</div>
					</InfoWindow>
				)}
			</HominemMap>

			<SearchDirectionsForm
				onLocationFound={handleLocationFound}
				onDirectionsFound={handleDirectionsFound}
				onClear={handleClear}
				isGeocodingLoading={isGeocodingLoading}
				isDirectionsLoading={isDirectionsLoading}
				geocodeError={geocodeQuery.error}
				directionsError={directionsMutation.error}
				directions={directions}
			/>
		</div>
	);
};

export default function GoogleMapsPage() {
	if (!GOOGLE_MAPS_API_KEY) {
		return (
			<div className="min-h-screen bg-gray-100 flex items-center justify-center">
				<div className="bg-stone-50 border border-stone-200 rounded-2xl shadow-sm p-8 max-w-md mx-auto text-center">
					<h2 className="font-serif text-2xl font-medium text-stone-900 mb-4">
						Maps Configuration Required
					</h2>
					<p className="text-stone-600 font-light mb-6">
						Google Maps API key is required to display the map. Please configure
						the VITE_GOOGLE_API_KEY environment variable.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div>
			<header className="bg-blue-600 text-white p-6 shadow-md">
				<div className="container mx-auto max-w-5xl">
					<h1 className="text-3xl font-bold font-serif">Mappy</h1>
				</div>
			</header>

			<main className="container mx-auto p-6 max-w-5xl">
				<div className="bg-white rounded-lg shadow-lg p-6 mb-8">
					<div className="relative h-[600px]">
						<APIProvider
							apiKey={GOOGLE_MAPS_API_KEY}
							onLoad={() => console.log("Google Maps API loaded successfully")}
						>
							<GoogleMapsContent />
						</APIProvider>
					</div>
				</div>
			</main>
		</div>
	);
}
