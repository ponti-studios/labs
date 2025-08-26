import { Map as ReactGoogleMaps } from "@vis.gl/react-google-maps";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

interface HominemMapProps {
	children: ReactNode;
	center: { lat: number; lng: number };
	zoom: number;
	className?: string;
	gestureHandling?: "cooperative" | "greedy" | "none";
	disableDefaultUI?: boolean;
	mapTypeControl?: boolean;
	streetViewControl?: boolean;
	fullscreenControl?: boolean;
	zoomControl?: boolean;
	styles?: google.maps.MapTypeStyle[];
	onError?: (error: string) => void;
}

const defaultStyles: google.maps.MapTypeStyle[] = [
	{
		featureType: "all",
		elementType: "geometry",
		stylers: [{ color: "#f5f5f4" }],
	},
	{
		featureType: "all",
		elementType: "labels.text.fill",
		stylers: [{ color: "#78716c" }],
	},
	{
		featureType: "all",
		elementType: "labels.text.stroke",
		stylers: [{ color: "#ffffff" }, { weight: 2 }],
	},
	{
		featureType: "road",
		elementType: "geometry",
		stylers: [{ color: "#ffffff" }],
	},
	{
		featureType: "road.highway",
		elementType: "geometry",
		stylers: [{ color: "#92a3a3" }],
	},
	{
		featureType: "water",
		elementType: "geometry",
		stylers: [{ color: "#a3b18a" }],
	},
	{
		featureType: "poi.park",
		elementType: "geometry",
		stylers: [{ color: "#dad7cd" }],
	},
];

export default function HominemMap({
	children,
	center,
	zoom,
	className = "h-full rounded-2xl",
	gestureHandling = "greedy",
	disableDefaultUI = false,
	mapTypeControl = true,
	streetViewControl = true,
	fullscreenControl = true,
	zoomControl = true,
	styles = defaultStyles,
	onError,
}: HominemMapProps) {
	const [mapError, setMapError] = useState<string | null>(null);

	// Handle Google Maps API errors
	useEffect(() => {
		if (typeof window !== "undefined") {
			(window as any).gm_authFailure = () => {
				setMapError(
					"Google Maps API authentication failed. Please check your API key.",
				);
				onError?.(
					"Google Maps API authentication failed. Please check your API key.",
				);
			};
		}
	}, [onError]);

	if (mapError) {
		return (
			<div className="flex w-full h-full justify-center items-center">
				<div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-md p-8 max-w-lg mx-auto text-center">
					<h2 className="text-2xl font-bold text-yellow-800 mb-4">
						Google Maps Error
					</h2>
					<p className="text-yellow-700 mb-4">{mapError}</p>
					<div className="text-sm text-yellow-600 text-left">
						<p className="font-semibold mb-2">Common solutions:</p>
						<ul className="list-disc pl-5 space-y-1">
							<li>
								Check if the Google Maps JavaScript API is enabled in your
								Google Cloud Console
							</li>
							<li>Verify billing is enabled for your Google Cloud project</li>
							<li>Check API key restrictions (HTTP referrers, IP addresses)</li>
							<li>Ensure the API key has sufficient permissions</li>
						</ul>
					</div>
				</div>
			</div>
		);
	}

	return (
		<ReactGoogleMaps
			className={className}
			center={center}
			zoom={zoom}
			gestureHandling={gestureHandling}
			disableDefaultUI={disableDefaultUI}
			mapTypeControl={mapTypeControl}
			streetViewControl={streetViewControl}
			fullscreenControl={fullscreenControl}
			zoomControl={zoomControl}
			styles={styles}
		>
			{children}
		</ReactGoogleMaps>
	);
}
