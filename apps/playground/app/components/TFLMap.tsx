import { useQuery } from '@tanstack/react-query';
import {
  APIProvider,
  Marker,
  Map as ReactGoogleMaps,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { X as XIcon } from 'lucide-react';
import { useState } from 'react';
import { GOOGLE_MAPS_API_KEY } from '~/lib/constants';
import type { Camera, Cameras } from '~/lib/tfl/types';

const TFLMapContent = () => {
  const map = useMap();
  const google = useMapsLibrary('core');
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  const {
    data: cameras,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['tfl-cameras'],
    queryFn: async (): Promise<Cameras> => {
      const response = await fetch('/api/tfl');
      if (!response.ok) {
        throw new Error('Failed to fetch camera data');
      }
      const data = await response.json();
      return data.cameras;
    },
  });

  if (error) {
    return (
      <div className="flex w-full h-full justify-center items-center">
        <div className="bg-stone-50 border border-stone-200 rounded-2xl shadow-sm p-8 max-w-md mx-auto text-center">
          <h2 className="font-serif text-2xl font-medium text-stone-900 mb-4">
            Unable to Load Cameras
          </h2>
          <p className="text-stone-600 font-light">
            {error instanceof Error ? error.message : 'Failed to load camera data'}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex w-full h-full justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-stone-300 border-t-olive-600 mb-4" />
          <p className="text-stone-600 font-light">Loading camera feeds...</p>
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="flex w-full h-full justify-center items-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-md p-8 max-w-lg mx-auto text-center">
          <h2 className="text-2xl font-bold text-yellow-800 mb-4">Google Maps Error</h2>
          <p className="text-yellow-700 mb-4">{mapError}</p>
          <div className="text-sm text-yellow-600 text-left">
            <p className="font-semibold mb-2">Common solutions:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Check if the Google Maps JavaScript API is enabled in your Google Cloud Console
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
    <div className="relative w-full h-full">
      {selectedCamera && (
        <div className="absolute bottom-6 left-6 w-80 max-w-[calc(100vw-3rem)] bg-white/95 backdrop-blur-md z-20 rounded-2xl shadow-2xl border border-stone-200/50 overflow-hidden">
          <div className="relative">
            <button
              type="button"
              className="absolute top-4 right-4 bg-stone-800/10 hover:bg-stone-800/20 text-stone-700 rounded-full h-8 w-8 flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
              onClick={() => setSelectedCamera(null)}
            >
              <XIcon size={16} />
            </button>
          </div>
          <div className="relative overflow-hidden">
            <img
              alt={selectedCamera.commonName}
              className="w-full h-48 object-cover"
              src={selectedCamera.imageUrl}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='192' viewBox='0 0 320 192'%3E%3Crect width='320' height='192' fill='%23f5f5f4'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2378716c' font-family='serif' font-size='14'%3ECamera Unavailable%3C/text%3E%3C/svg%3E";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </div>
          <div className="p-6">
            <h3 className="font-serif text-lg font-medium text-stone-900 mb-2 leading-tight">
              {selectedCamera.commonName}
            </h3>
            <div className="flex items-center justify-between">
              <p className="text-sm text-stone-600 font-light">
                {selectedCamera.view || 'Traffic Camera'}
              </p>
              {selectedCamera.available === 'true' && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-olive-100 text-olive-800 border border-olive-200">
                  Live
                </span>
              )}
            </div>
          </div>
        </div>
      )}{' '}
      <ReactGoogleMaps
        className="h-full rounded-2xl"
        zoom={selectedCamera ? 16 : 12}
        center={
          selectedCamera
            ? { lat: selectedCamera.lat, lng: selectedCamera.lng }
            : { lat: 51.5074, lng: -0.1278 } // London center
        }
        gestureHandling="greedy"
        disableDefaultUI={true}
        mapTypeControl={false}
        streetViewControl={false}
        fullscreenControl={false}
        styles={[
          {
            featureType: 'all',
            elementType: 'geometry',
            stylers: [{ color: '#f5f5f4' }],
          },
          {
            featureType: 'all',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#78716c' }],
          },
          {
            featureType: 'all',
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#ffffff' }, { weight: 2 }],
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#ffffff' }],
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry',
            stylers: [{ color: '#92a3a3' }],
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#a3b18a' }],
          },
          {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [{ color: '#dad7cd' }],
          },
        ]}
      >
        {' '}
        {cameras?.map((camera) => (
          <Marker
            key={camera.id}
            position={{ lat: camera.lat, lng: camera.lng }}
            title={camera.commonName}
            icon={{
              anchor: google && new google.Point(16, 16),
              scaledSize:
                google &&
                (selectedCamera?.id === camera.id
                  ? new google.Size(40, 40)
                  : new google.Size(32, 32)),
              url: selectedCamera?.id === camera.id ? '/camera-selected.png' : '/camera.png',
            }}
            onClick={() => setSelectedCamera(camera)}
          />
        ))}
      </ReactGoogleMaps>
    </div>
  );
};

export default function TFLMap() {
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="flex w-full h-full justify-center items-center">
        <div className="bg-stone-50 border border-stone-200 rounded-2xl shadow-sm p-8 max-w-md mx-auto text-center">
          <h2 className="font-serif text-2xl font-medium text-stone-900 mb-4">
            Maps Configuration Required
          </h2>
          <p className="text-stone-600 font-light mb-6">
            Google Maps API key is required to display the camera map. Please configure the
            VITE_GOOGLE_MAPS_API_KEY environment variable.
          </p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider
      apiKey={GOOGLE_MAPS_API_KEY}
      onLoad={() => console.log('Maps API loaded successfully')}
    >
      <div className="w-full h-full">
        <TFLMapContent />
      </div>
    </APIProvider>
  );
}
