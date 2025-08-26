// Google Maps API type declarations
declare global {
	interface Window {
		google: {
			maps: {
				Geocoder: new () => google.maps.Geocoder;
				DirectionsService: new () => google.maps.DirectionsService;
				DirectionsRenderer: new (
					options: google.maps.DirectionsRendererOptions,
				) => google.maps.DirectionsRenderer;
				TravelMode: {
					DRIVING: google.maps.TravelMode;
				};
				LatLngBounds: new () => google.maps.LatLngBounds;
			};
		};
	}
}

export {};
